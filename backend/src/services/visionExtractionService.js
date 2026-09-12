const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let geminiCallCount = 0;

const VISION_PROMPT = `You are a pharmacist's assistant helping read a handwritten doctor's prescription image. Your job is to extract every medicine name mentioned, using medical knowledge to correctly interpret handwriting that a generic OCR tool would misread.

Instructions:
- Look at the prescription image carefully, including any cursive, shorthand, or abbreviated medical handwriting.
- For each medicine you identify, output its most likely correct standard/generic drug name, dosage if visible, and how confident you are.
- If handwriting is ambiguous between two plausible real medicines, list your best guess and note the alternative in a "notes" field.
- Do NOT invent medicines that are not plausibly present in the image.
- Do NOT include patient name, doctor name, or other non-medicine text in the medicine list.
- Respond in STRICT JSON ONLY, no other text, no markdown code fences, matching exactly this schema:

{
  "medicines": [
    {
      "name": "string - best-guess standard medicine name",
      "dosage": "string or null - e.g. '500mg', 'twice daily' if visible",
      "confidence": "high | medium | low",
      "notes": "string or null - mention ambiguity, alternative reading, or illegibility here"
    }
  ],
  "raw_observations": "string - one or two sentences on overall handwriting legibility, for internal logging only"
}

If you cannot identify any medicines at all, return an empty medicines array, not an error.`;

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.webp': return 'image/webp';
    case '.heic': return 'image/heic';
    case '.heif': return 'image/heif';
    case '.jpg':
    case '.jpeg':
    default:
      return 'image/jpeg';
  }
}

async function extractMedicinesFromPrescription(imagePath) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_copied_key_here')) {
    console.warn('⚠️ [Vision OCR] GEMINI_API_KEY is not configured in backend/.env.');
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Prescription image not found at: ${imagePath}`);
  }

  geminiCallCount++;
  console.log(`🤖 [Gemini Vision] Initiating AI prescription extraction (Call #${geminiCallCount}) for: ${path.basename(imagePath)}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  // 45-second timeout for image transfer & LLM vision inference
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 45000)
  );

  try {
    const apiCallPromise = model.generateContent([
      VISION_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const result = await Promise.race([apiCallPromise, timeoutPromise]);
    const rawText = result.response.text();
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(cleaned);
    console.log(`✅ [Gemini Vision] Extracted ${parsed.medicines ? parsed.medicines.length : 0} medicines. Observations: "${parsed.raw_observations || 'N/A'}"`);
    
    return {
      provider: 'gemini_vision',
      model: 'gemini-3.6-flash',
      medicines: parsed.medicines || [],
      raw_observations: parsed.raw_observations || '',
      apiCallCount: geminiCallCount,
    };
  } catch (error) {
    if (error.message === 'TIMEOUT_EXCEEDED') {
      console.error('⏱️ [Gemini Vision] Request timed out after 45 seconds.');
      throw new Error('Gemini Vision AI request timed out. Please try again.');
    }

    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      console.error('🚫 [Gemini Vision] Daily scan limit / quota reached.');
      throw new Error('QUOTA_EXCEEDED');
    }

    console.error('❌ [Gemini Vision] Extraction error:', error.message || error);
    throw error;
  }
}

function getGeminiApiCallCount() {
  return geminiCallCount;
}

module.exports = {
  extractMedicinesFromPrescription,
  getGeminiApiCallCount,
  VISION_PROMPT,
};
