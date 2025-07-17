const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const db = require('../utils/db');

// Admin: System-wide summary
router.get('/summary', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [[{ total_users }]] = await db.query("SELECT COUNT(*) as total_users FROM users");
    const [[{ total_staff }]] = await db.query("SELECT COUNT(*) as total_staff FROM users WHERE role = 'staff'");
    const [[{ total_admins }]] = await db.query("SELECT COUNT(*) as total_admins FROM users WHERE role = 'admin'");
    const [[{ total_equipment }]] = await db.query("SELECT COUNT(*) as total_equipment FROM equipment");
    const [[{ available_equipment }]] = await db.query("SELECT COUNT(*) as available_equipment FROM equipment WHERE status = 'available'");
    const [[{ lost_equipment }]] = await db.query("SELECT COUNT(*) as lost_equipment FROM equipment WHERE status = 'lost'");
    const [[{ damaged_equipment }]] = await db.query("SELECT COUNT(*) as damaged_equipment FROM equipment WHERE status = 'damaged'");
    const [[{ active_borrows }]] = await db.query("SELECT COUNT(*) as active_borrows FROM borrowed_equipment WHERE status = 'borrowed'");
    const [[{ returned_borrows }]] = await db.query("SELECT COUNT(*) as returned_borrows FROM borrowed_equipment WHERE status = 'returned'");
    const [[{ unpaid_penalties }]] = await db.query("SELECT COUNT(*) as unpaid_penalties FROM penalties WHERE status = 'unpaid'");
    const [[{ paid_penalties }]] = await db.query("SELECT COUNT(*) as paid_penalties FROM penalties WHERE status = 'paid'");
    const [[{ waived_penalties }]] = await db.query("SELECT COUNT(*) as waived_penalties FROM penalties WHERE status = 'waived'");
    const [[most_borrowed]] = await db.query(`SELECT equipment_id, COUNT(*) as borrow_count FROM borrowed_equipment GROUP BY equipment_id ORDER BY borrow_count DESC LIMIT 1`);
    let most_borrowed_equipment = null;
    if (most_borrowed && most_borrowed.equipment_id) {
      const [[eq]] = await db.query('SELECT name FROM equipment WHERE id = ?', [most_borrowed.equipment_id]);
      most_borrowed_equipment = { id: most_borrowed.equipment_id, name: eq?.name, count: most_borrowed.borrow_count };
    }
    res.json({
      total_users,
      total_staff,
      total_admins,
      total_equipment,
      available_equipment,
      lost_equipment,
      damaged_equipment,
      active_borrows,
      returned_borrows,
      unpaid_penalties,
      paid_penalties,
      waived_penalties,
      most_borrowed_equipment
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary.', error: error.message });
  }
});

// Staff: Personal/assigned summary
router.get('/staff-summary', authenticate, authorizeRoles('staff'), async (req, res) => {
  try {
    // Example: borrows handled by this staff (if you track staff_id in borrowed_equipment)
    // For now, just return all active borrows and equipment
    const [[{ active_borrows }]] = await db.query("SELECT COUNT(*) as active_borrows FROM borrowed_equipment WHERE status = 'borrowed'");
    const [[{ total_equipment }]] = await db.query("SELECT COUNT(*) as total_equipment FROM equipment");
    res.json({ active_borrows, total_equipment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff summary.', error: error.message });
  }
});

module.exports = router; 