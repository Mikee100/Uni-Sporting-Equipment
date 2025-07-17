const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const db = require('../utils/db');

// Helper to build date filter SQL
function dateFilterSQL(table, start, end, dateCol) {
  let sql = '';
  if (start) sql += ` AND ${table ? table + '.' : ''}${dateCol} >= '${start}'`;
  if (end) sql += ` AND ${table ? table + '.' : ''}${dateCol} <= '${end} 23:59:59'`;
  return sql;
}

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

// Most borrowed equipment (top 10)
router.get('/most-borrowed', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('b', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT e.id, e.name, e.sport, COUNT(b.id) as borrow_count
      FROM borrowed_equipment b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateSQL}
      GROUP BY e.id, e.name, e.sport
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch most borrowed equipment.', error: error.message });
  }
});

// Borrowing by sport
router.get('/borrowing-by-sport', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('b', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT e.sport, COUNT(b.id) as borrow_count
      FROM borrowed_equipment b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateSQL}
      GROUP BY e.sport
      ORDER BY borrow_count DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrowing by sport.', error: error.message });
  }
});

// Overdue items
router.get('/overdue', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('b', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT b.id, u.name as user_name, u.email, e.name as equipment_name, e.sport, b.due_date
      FROM borrowed_equipment b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.status = 'borrowed' AND b.due_date < CURDATE() ${dateSQL}
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overdue items.', error: error.message });
  }
});

// Penalties summary
router.get('/penalties-summary', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('', start_date, end_date, 'issued_at');
    const [rows] = await db.query(`
      SELECT reason, COUNT(id) as count, SUM(amount) as total_amount
      FROM penalties
      WHERE 1=1 ${dateSQL}
      GROUP BY reason
      ORDER BY count DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch penalties summary.', error: error.message });
  }
});

// User activity (top 10 borrowers)
router.get('/top-users', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('b', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email, COUNT(b.id) as borrow_count
      FROM users u
      JOIN borrowed_equipment b ON u.id = b.user_id
      WHERE 1=1 ${dateSQL}
      GROUP BY u.id, u.name, u.email
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top users.', error: error.message });
  }
});

// Borrowing trend (borrows per day)
router.get('/analytics/borrowing-trend', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT DATE(borrow_date) as date, COUNT(*) as count
      FROM borrowed_equipment
      WHERE 1=1 ${dateSQL}
      GROUP BY DATE(borrow_date)
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch borrowing trend.', error: error.message });
  }
});

// Penalty trend (penalties per day)
router.get('/analytics/penalty-trend', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('', start_date, end_date, 'issued_at');
    const [rows] = await db.query(`
      SELECT DATE(issued_at) as date, reason, COUNT(*) as count
      FROM penalties
      WHERE 1=1 ${dateSQL}
      GROUP BY DATE(issued_at), reason
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch penalty trend.', error: error.message });
  }
});

// Equipment loss/damage rate
router.get('/analytics/loss-damage-rate', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('b', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT e.id, e.name, e.sport,
        SUM(CASE WHEN b.status = 'lost' THEN 1 ELSE 0 END) as lost_count,
        SUM(CASE WHEN b.status = 'damaged' THEN 1 ELSE 0 END) as damaged_count
      FROM borrowed_equipment b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateSQL}
      GROUP BY e.id, e.name, e.sport
      HAVING lost_count > 0 OR damaged_count > 0
      ORDER BY (lost_count + damaged_count) DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch loss/damage rate.', error: error.message });
  }
});

// Active users trend (unique borrowers per day)
router.get('/analytics/active-users', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const dateSQL = dateFilterSQL('', start_date, end_date, 'borrow_date');
    const [rows] = await db.query(`
      SELECT DATE(borrow_date) as date, COUNT(DISTINCT user_id) as active_users
      FROM borrowed_equipment
      WHERE 1=1 ${dateSQL}
      GROUP BY DATE(borrow_date)
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active users trend.', error: error.message });
  }
});

// Low stock equipment
router.get('/analytics/low-stock', authenticate, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, sport, quantity
      FROM equipment
      WHERE quantity <= 3
      ORDER BY quantity ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch low stock equipment.', error: error.message });
  }
});

module.exports = router; 