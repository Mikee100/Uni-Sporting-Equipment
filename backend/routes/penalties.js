const express = require('express');
const router = express.Router();
const {
  getAllPenalties,
  getPenaltyById,
  getPenaltiesByUser,
  createPenalty,
  updatePenalty,
  deletePenalty
} = require('../controllers/penaltiesController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Admin can view all penalties
router.get('/', authenticate, authorizeRoles('admin'), getAllPenalties);

// Users can view their own penalties
router.get('/user/:userId', authenticate, authorizeRoles('admin', 'user', 'staff'), getPenaltiesByUser);
router.get('/my', authenticate, authorizeRoles('user', 'admin', 'staff'), (req, res) => getPenaltiesByUser({ ...req, params: { userId: req.user.id } }, res));

// Admin can view any penalty by ID
router.get('/:id', authenticate, authorizeRoles('admin'), getPenaltyById);

// Admin can create, update, delete penalties
router.post('/', authenticate, authorizeRoles('admin'), createPenalty);
router.put('/:id', authenticate, authorizeRoles('admin'), updatePenalty);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePenalty);

module.exports = router; 