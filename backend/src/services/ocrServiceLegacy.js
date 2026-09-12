const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

/**
 * Modular OCR Service Interface
 * Easily swappable for Google Cloud Vision API or AWS Textract
 */
class OCRService {
  constructor(provider = 'tesseract') {
    this.provider = provider;
  }

  async extractText(imagePath) {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found at path: ${imagePath}`);
    }

    if (this.provider === 'google_vision') {
      // Future scope: Google Cloud Vision API implementation
      return this._extractWithGoogleVision(imagePath);
    }

    return this._extractWithTesseract(imagePath);
  }

  async _extractWithTesseract(imagePath) {
    try {
      console.log(`🔍 [OCR] Starting Tesseract OCR scan on: ${path.basename(imagePath)}`);
      
      const { data } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Log progress optionally
            }
          }
        }
      );

      const rawText = data.text || '';
      console.log(`✅ [OCR] Text extraction complete (${rawText.length} chars extracted).`);
      return {
        provider: 'tesseract',
        confidence: data.confidence || 85,
        rawText: rawText.trim(),
        lines: data.lines ? data.lines.map(l => l.text.trim()).filter(Boolean) : [],
      };
    } catch (error) {
      console.error('❌ [OCR] Tesseract extraction failed:', error);
      throw error;
    }
  }

  async _extractWithGoogleVision(imagePath) {
    // Placeholder for Google Cloud Vision API client
    throw new Error('Google Cloud Vision provider not configured. Using Tesseract default.');
  }
}

module.exports = new OCRService();
