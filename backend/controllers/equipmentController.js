const Equipment = require('../models/equipment');

const getAllEquipment = async (req, res) => {
  try {
    const { sport } = req.query;
    const equipment = await Equipment.getAll(sport);
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch equipment.', error: error.message });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.getById(req.params.id);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found.' });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch equipment.', error: error.message });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { name, description, quantity, status, sport } = req.body;
    if (!name || quantity == null) {
      return res.status(400).json({ message: 'Name and quantity are required.' });
    }
    const newEquipment = await Equipment.create({ name, description, quantity, status, sport });
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create equipment.', error: error.message });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { name, description, quantity, status, sport } = req.body;
    const updated = await Equipment.update(req.params.id, { name, description, quantity, status, sport });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update equipment.', error: error.message });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    await Equipment.delete(req.params.id);
    res.json({ message: 'Equipment deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete equipment.', error: error.message });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
}; 