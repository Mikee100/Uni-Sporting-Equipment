const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Allow staff and admin to fetch users with role 'user' only
router.get('/', authenticate, (req, res, next) => {
  if (req.query.role === 'user') {
    // Only allow staff and admin
    return authorizeRoles('admin', 'staff')(req, res, next);
  }
  // Only admin can access all users
  return authorizeRoles('admin')(req, res, next);
}, async (req, res) => {
  if (req.query.role === 'user') {
    // Filter users by role 'user'
    try {
      const users = await require('../models/user').getByRole('user');
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
    }
  }
  // Default: all users (admin only)
  return getAllUsers(req, res);
});

// Admin-only user management
router.get('/:id', authenticate, authorizeRoles('admin'), getUserById);
router.post('/', authenticate, authorizeRoles('admin'), createUser);
router.put('/:id', authenticate, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router; 