const Penalties = require('../models/penalties');

const getAllPenalties = async (req, res) => {
  try {
    const penalties = await Penalties.getAll();
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch penalties.', error: error.message });
  }
};

const getPenaltyById = async (req, res) => {
  try {
    const penalty = await Penalties.getById(req.params.id);
    if (!penalty) return res.status(404).json({ message: 'Penalty not found.' });
    res.json(penalty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch penalty.', error: error.message });
  }
};

const getPenaltiesByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    console.log('getPenaltiesByUser called for userId:', userId, 'req.user:', req.user); // Debug log
    const penalties = await Penalties.getByUser(userId);
    console.log('Penalties found:', penalties.length); // Debug log
    res.json(penalties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user penalties.', error: error.message });
  }
};

const createPenalty = async (req, res) => {
  try {
    const { user_id, borrowed_equipment_id, amount, reason, status } = req.body;
    if (!user_id || !borrowed_equipment_id || !amount || !reason) {
      return res.status(400).json({ message: 'user_id, borrowed_equipment_id, amount, and reason are required.' });
    }
    const penalty = await Penalties.create({ user_id, borrowed_equipment_id, amount, reason, status });
    res.status(201).json(penalty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create penalty.', error: error.message });
  }
};

const updatePenalty = async (req, res) => {
  try {
    const { amount, reason, status } = req.body;
    const penalty = await Penalties.update(req.params.id, { amount, reason, status });
    res.json(penalty);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update penalty.', error: error.message });
  }
};

const deletePenalty = async (req, res) => {
  try {
    await Penalties.delete(req.params.id);
    res.json({ message: 'Penalty deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete penalty.', error: error.message });
  }
};

module.exports = {
  getAllPenalties,
  getPenaltyById,
  getPenaltiesByUser,
  createPenalty,
  updatePenalty,
  deletePenalty
}; 