const { Op } = require('sequelize');
const { Medicine } = require('../models');

exports.searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      const popular = await Medicine.findAll({ limit: 20, order: [['name', 'ASC']] });
      return res.json({ success: true, count: popular.length, medicines: popular });
    }

    const searchTerm = `%${q.trim()}%`;
    const medicines = await Medicine.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: searchTerm } },
          { generic_name: { [Op.like]: searchTerm } },
          { alternatives: { [Op.like]: searchTerm } },
          { category: { [Op.like]: searchTerm } },
        ],
      },
      limit: 20,
      order: [['name', 'ASC']],
    });

    return res.json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    console.error('searchMedicines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to search medicines.' });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
    return res.json({ success: true, count: medicines.length, medicines });
  } catch (error) {
    console.error('getAllMedicines error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch medicine list.' });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { name, generic_name, category, dosage_form, alternatives, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Medicine name is required.' });
    }

    const medicine = await Medicine.create({
      name,
      generic_name,
      category: category || 'General',
      dosage_form: dosage_form || 'Tablet',
      alternatives,
      description,
    });

    return res.status(201).json({ success: true, medicine });
  } catch (error) {
    console.error('addMedicine error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add medicine.' });
  }
};
