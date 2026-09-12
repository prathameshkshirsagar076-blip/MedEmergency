const Fuse = require('fuse.js');
const { Medicine } = require('../models');

/**
 * Fuzzy Medicine Matcher Engine
 */
class MedicineMatchingService {
  constructor() {
    this.fuse = null;
    this.medicinesCache = [];
    this.lastCacheTime = 0;
  }

  async init() {
    const now = Date.now();
    // Cache for 5 minutes
    if (!this.fuse || (now - this.lastCacheTime > 5 * 60 * 1000)) {
      this.medicinesCache = await Medicine.findAll({ raw: true });
      
      this.fuse = new Fuse(this.medicinesCache, {
        keys: [
          { name: 'name', weight: 0.6 },
          { name: 'generic_name', weight: 0.3 },
          { name: 'alternatives', weight: 0.2 },
        ],
        threshold: 0.45, // 0.0 is perfect match, 1.0 matches anything
        distance: 100,
        minMatchCharLength: 3,
        includeScore: true,
      });

      this.lastCacheTime = now;
    }
  }

  cleanOcrToken(token) {
    return token
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async matchPrescriptionText(rawText) {
    await this.init();

    if (!rawText || !rawText.trim()) {
      return [];
    }

    // Split text into candidate lines and potential medicine names
    const lines = rawText.split(/[\r\n]+/);
    const candidateTokens = new Set();

    // Noise words to ignore
    const stopWords = new Set([
      'rx', 'dr', 'doctor', 'patient', 'name', 'date', 'age', 'sex', 'gender',
      'hospital', 'clinic', 'ph', 'phone', 'address', 'signature', 'mg', 'ml',
      'tab', 'tablet', 'cap', 'capsule', 'syrup', 'inj', 'injection', 'od', 'bd', 'tds',
      'sos', 'daily', 'times', 'day', 'days', 'after', 'before', 'food', 'meals', 'take'
    ]);

    for (const line of lines) {
      const cleanLine = this.cleanOcrToken(line);
      if (cleanLine.length >= 3) {
        candidateTokens.add(cleanLine);

        // Also split by common punctuation/spaces for multi-word lines
        const words = cleanLine.split(' ').filter(w => w.length >= 3 && !stopWords.has(w.toLowerCase()));
        if (words.length > 0 && words.length <= 4) {
          candidateTokens.add(words.join(' '));
        }
        for (const w of words) {
          if (w.length >= 4) {
            candidateTokens.add(w);
          }
        }
      }
    }

    const matchedMedicines = new Map();

    for (const candidate of candidateTokens) {
      const results = this.fuse.search(candidate);
      if (results && results.length > 0) {
        const best = results[0];
        // Score: 0 is best match (100% confidence), 1 is worst
        const confidence = Math.round((1 - best.score) * 100);

        if (confidence >= 55) { // Match threshold
          const medId = best.item.id;
          if (!matchedMedicines.has(medId) || matchedMedicines.get(medId).confidence < confidence) {
            matchedMedicines.set(medId, {
              medicine_id: best.item.id,
              name: best.item.name,
              generic_name: best.item.generic_name,
              dosage_form: best.item.dosage_form,
              category: best.item.category,
              alternatives: best.item.alternatives,
              confidence: confidence,
              matched_token: candidate,
              is_selected: true,
            });
          }
        }
      }
    }

    // Sort by confidence descending
    return Array.from(matchedMedicines.values()).sort((a, b) => b.confidence - a.confidence);
  }
}

module.exports = new MedicineMatchingService();
