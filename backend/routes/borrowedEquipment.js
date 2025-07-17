const express = require('express');
const router = express.Router();
const {
  getAllBorrowed,
  getBorrowedById,
  getBorrowedByUser,
  borrowEquipment,
  returnEquipment,
  requestBorrow,
  cancelBorrowRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/borrowedEquipmentController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Staff can view all borrow records
router.get('/', authenticate, authorizeRoles('admin', 'staff'), getAllBorrowed);

// Users can view their own records (shortcut)
router.get('/my', authenticate, authorizeRoles('user', 'admin', 'staff'), (req, res) => getBorrowedByUser({ ...req, params: { userId: req.user.id } }, res));

// Users can view their own borrow records
router.get('/user/:userId', authenticate, authorizeRoles('admin', 'staff', 'user'), getBorrowedByUser);

// Staff/Admin: List all pending borrow requests
router.get('/pending', authenticate, authorizeRoles('admin', 'staff'), getPendingRequests);

// Staff can view any record by ID
router.get('/:id', authenticate, authorizeRoles('admin', 'staff'), getBorrowedById);

// Staff can record borrow for any user
router.post('/borrow', authenticate, authorizeRoles('admin', 'staff'), borrowEquipment);

// Staff can record return for any record
router.put('/return/:id', authenticate, authorizeRoles('admin', 'staff'), returnEquipment);

// Students can request to borrow equipment
router.post('/request', authenticate, authorizeRoles('user'), requestBorrow);

// Students can cancel their own pending borrow requests
router.delete('/:id', authenticate, authorizeRoles('user'), cancelBorrowRequest);

// Staff/Admin: Approve a pending request
router.put('/approve/:id', authenticate, authorizeRoles('admin', 'staff'), approveRequest);
// Staff/Admin: Reject a pending request
router.put('/reject/:id', authenticate, authorizeRoles('admin', 'staff'), rejectRequest);

module.exports = router; 