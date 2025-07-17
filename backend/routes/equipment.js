const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// All authenticated users can view equipment
router.get('/', authenticate, getAllEquipment);
router.get('/:id', authenticate, getEquipmentById);

// Only admin and staff can create, update, delete
router.post('/', authenticate, authorizeRoles('admin', 'staff'), createEquipment);
router.put('/:id', authenticate, authorizeRoles('admin', 'staff'), updateEquipment);
router.delete('/:id', authenticate, authorizeRoles('admin', 'staff'), deleteEquipment);

module.exports = router; 