const path = require('path');
const { Prescription, PrescriptionMedicine, Medicine } = require('../models');
const ocrService = require('../services/ocrService');
const ocrServiceLegacy = require('../services/ocrServiceLegacy');
const visionExtractionService = require('../services/visionExtractionService');
const matchingService = require('../services/matchingService');

function mapConfidenceLevelToFloat(confidence) {
  if (typeof confidence === 'number') return confidence;
  const c = String(confidence).toLowerCase();
  if (c === 'high') return 0.95;
  if (c === 'medium') return 0.75;
  if (c === 'low') return 0.45;
  return 0.85;
}

function mapConfidenceLevelToString(confidence) {
  if (typeof confidence === 'string' && ['high', 'medium', 'low'].includes(confidence.toLowerCase())) {
    return confidence.toLowerCase();
  }
  const num = parseFloat(confidence);
  if (!isNaN(num)) {
    if (num >= 0.8 || num >= 80) return 'high';
    if (num >= 0.5 || num >= 50) return 'medium';
    return 'low';
  }
  return 'high';
}

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No prescription file uploaded.' });
    }

    const { is_emergency } = req.body;
    const isEmergency = is_emergency === 'true' || is_emergency === true;
    const relativeFilePath = `uploads/prescriptions/${req.file.filename}`;
    const absoluteFilePath = req.file.path;

    // Create Prescription Record
    const prescription = await Prescription.create({
      patient_id: req.user.id,
      image_path: relativeFilePath,
      is_emergency: isEmergency,
      status: 'uploaded',
    });

    const useAiVision = process.env.USE_AI_VISION_OCR !== 'false' && Boolean(process.env.GEMINI_API_KEY);
    let extractedMedicines = [];
    let extractionProvider = 'tesseract';

    if (useAiVision) {
      try {
        const visionResult = await visionExtractionService.extractMedicinesFromPrescription(absoluteFilePath);
        extractionProvider = 'gemini_vision';
        prescription.ocr_raw_text = visionResult.raw_observations || 'Extracted via Google Gemini Vision AI';
        prescription.status = 'scanned';
        await prescription.save();

        for (const item of visionResult.medicines) {
          if (item.name && item.name.trim()) {
            const confLevel = mapConfidenceLevelToString(item.confidence);
            const confFloat = mapConfidenceLevelToFloat(item.confidence);
            
            // Fuzzy match against master medicines catalog for category / alternatives
            const matched = await matchingService.matchPrescriptionText(item.name);
            const masterMatch = matched.length > 0 ? matched[0] : null;

            const entry = await PrescriptionMedicine.create({
              prescription_id: prescription.id,
              medicine_id: masterMatch ? masterMatch.medicine_id : null,
              custom_name: item.name.trim(),
              confidence: confFloat,
              confidence_level: confLevel,
              dosage_instruction: item.dosage || '',
              notes: item.notes || null,
              is_selected: true,
            });

            extractedMedicines.push({
              id: entry.id,
              name: item.name.trim(),
              custom_name: item.name.trim(),
              dosage: item.dosage || '',
              dosage_instruction: item.dosage || '',
              confidence: confFloat,
              confidence_level: confLevel,
              notes: item.notes || null,
              is_selected: true,
              master_medicine: masterMatch ? masterMatch.medicine : null,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('⚠️ Gemini Vision failed, falling back to legacy OCR:', geminiErr.message);
        // Fallback to legacy OCR below
      }
    }

    // Fallback if Gemini Vision is disabled or failed
    if (extractedMedicines.length === 0 && (!useAiVision || prescription.status !== 'scanned')) {
      try {
        const ocrResult = await ocrServiceLegacy.extractText(absoluteFilePath);
        prescription.ocr_raw_text = ocrResult.rawText;
        prescription.status = 'scanned';
        await prescription.save();

        const matchedList = await matchingService.matchPrescriptionText(ocrResult.rawText);
        for (const med of matchedList) {
          const entry = await PrescriptionMedicine.create({
            prescription_id: prescription.id,
            medicine_id: med.medicine_id,
            custom_name: med.name,
            confidence: med.confidence / 100,
            confidence_level: mapConfidenceLevelToString(med.confidence),
            is_selected: true,
          });

          extractedMedicines.push({
            id: entry.id,
            name: med.name,
            custom_name: med.name,
            dosage: '',
            dosage_instruction: '',
            confidence: med.confidence / 100,
            confidence_level: mapConfidenceLevelToString(med.confidence),
            notes: null,
            is_selected: true,
            master_medicine: med.medicine,
          });
        }
      } catch (ocrErr) {
        console.warn('⚠️ Legacy OCR notice:', ocrErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Prescription uploaded and scanned successfully.',
      provider: extractionProvider,
      prescription: {
        id: prescription.id,
        image_path: prescription.image_path,
        is_emergency: prescription.is_emergency,
        ocr_raw_text: prescription.ocr_raw_text,
        status: prescription.status,
        created_at: prescription.created_at,
        medicines: extractedMedicines,
      },
    });
  } catch (error) {
    console.error('uploadPrescription error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload prescription.' });
  }
};

// New /extract endpoint with Google Gemini Vision
exports.extractMedicines = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOne({
      where: { id, patient_id: req.user.id },
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription record not found.' });
    }

    const absoluteFilePath = path.join(__dirname, '../../', prescription.image_path);

    try {
      const visionResult = await visionExtractionService.extractMedicinesFromPrescription(absoluteFilePath);
      
      // Clean previous extractions
      await PrescriptionMedicine.destroy({ where: { prescription_id: prescription.id } });

      const extractedMedicines = [];
      for (const item of visionResult.medicines) {
        if (item.name && item.name.trim()) {
          const confLevel = mapConfidenceLevelToString(item.confidence);
          const confFloat = mapConfidenceLevelToFloat(item.confidence);

          const matched = await matchingService.matchPrescriptionText(item.name);
          const masterMatch = matched.length > 0 ? matched[0] : null;

          const entry = await PrescriptionMedicine.create({
            prescription_id: prescription.id,
            medicine_id: masterMatch ? masterMatch.medicine_id : null,
            custom_name: item.name.trim(),
            confidence: confFloat,
            confidence_level: confLevel,
            dosage_instruction: item.dosage || '',
            notes: item.notes || null,
            is_selected: true,
          });

          extractedMedicines.push({
            id: entry.id,
            name: item.name.trim(),
            custom_name: item.name.trim(),
            dosage: item.dosage || '',
            dosage_instruction: item.dosage || '',
            confidence: confFloat,
            confidence_level: confLevel,
            notes: item.notes || null,
            is_selected: true,
            master_medicine: masterMatch ? masterMatch.medicine : null,
          });
        }
      }

      prescription.ocr_raw_text = visionResult.raw_observations || 'Extracted via Google Gemini Vision AI';
      prescription.status = 'scanned';
      await prescription.save();

      return res.json({
        success: true,
        message: 'Gemini AI Vision extraction completed.',
        provider: 'gemini_vision',
        raw_observations: visionResult.raw_observations,
        medicines: extractedMedicines,
      });
    } catch (visionError) {
      if (visionError.message === 'QUOTA_EXCEEDED') {
        return res.status(429).json({
          success: false,
          message: 'Daily scan limit reached, please try again tomorrow or enter medicines manually.',
        });
      }
      if (visionError.message === 'GEMINI_API_KEY_MISSING') {
        return res.status(400).json({
          success: false,
          message: 'GEMINI_API_KEY is not configured in backend/.env. Please add your key or use manual entry.',
        });
      }

      console.error('Vision extraction error:', visionError);
      return res.status(500).json({
        success: false,
        message: "Couldn't read this prescription clearly, please try a clearer photo or enter medicines manually.",
      });
    }
  } catch (error) {
    console.error('extractMedicines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to extract medicines from prescription.' });
  }
};

// Legacy /ocr endpoint maintained behind USE_AI_VISION_OCR flag
exports.runOcr = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOne({
      where: { id, patient_id: req.user.id },
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription record not found.' });
    }

    const useAiVision = process.env.USE_AI_VISION_OCR !== 'false' && Boolean(process.env.GEMINI_API_KEY);
    if (useAiVision) {
      return exports.extractMedicines(req, res);
    }

    const absoluteFilePath = path.join(__dirname, '../../', prescription.image_path);
    const ocrResult = await ocrServiceLegacy.extractText(absoluteFilePath);

    prescription.ocr_raw_text = ocrResult.rawText;
    prescription.status = 'scanned';
    await prescription.save();

    const matchedMedicines = await matchingService.matchPrescriptionText(ocrResult.rawText);

    return res.json({
      success: true,
      message: 'OCR Scan completed.',
      ocr_raw_text: ocrResult.rawText,
      medicines: matchedMedicines,
    });
  } catch (error) {
    console.error('runOcr error:', error);
    return res.status(500).json({ success: false, message: 'Failed to run OCR on prescription.' });
  }
};

exports.confirmMedicines = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicines } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medicine is required to proceed.' });
    }

    const prescription = await Prescription.findOne({
      where: { id, patient_id: req.user.id },
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    // Replace prescription medicines
    await PrescriptionMedicine.destroy({ where: { prescription_id: prescription.id } });

    const savedMedicines = [];
    for (const item of medicines) {
      if (item.name && item.name.trim()) {
        const confLevel = mapConfidenceLevelToString(item.confidence_level || item.confidence);
        const confFloat = mapConfidenceLevelToFloat(item.confidence);

        const entry = await PrescriptionMedicine.create({
          prescription_id: prescription.id,
          medicine_id: item.medicine_id || null,
          custom_name: item.name.trim(),
          confidence: confFloat,
          confidence_level: confLevel,
          dosage_instruction: item.dosage_instruction || item.dosage || '',
          notes: item.notes || null,
          is_selected: item.is_selected !== false,
        });
        savedMedicines.push(entry);
      }
    }

    prescription.status = 'processed';
    await prescription.save();

    return res.json({
      success: true,
      message: 'Prescription medicine list confirmed successfully.',
      medicines: savedMedicines,
    });
  } catch (error) {
    console.error('confirmMedicines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to confirm medicine list.' });
  }
};

exports.getPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findOne({
      where: { id },
      include: [
        {
          model: PrescriptionMedicine,
          as: 'medicines',
          include: [{ model: Medicine, as: 'master_medicine' }],
        },
      ],
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found.' });
    }

    if (req.user.role === 'patient' && prescription.patient_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, prescription });
  } catch (error) {
    console.error('getPrescription error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch prescription.' });
  }
};
