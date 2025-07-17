const db = require('../utils/db');

const BorrowedEquipment = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM borrowed_equipment');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM borrowed_equipment WHERE id = ?', [id]);
    return rows[0];
  },

  async getByUser(user_id) {
    const [rows] = await db.query('SELECT * FROM borrowed_equipment WHERE user_id = ?', [user_id]);
    return rows;
  },

  async borrow({ user_id, equipment_id, notes, due_date }) {
    const [result] = await db.query(
      'INSERT INTO borrowed_equipment (user_id, equipment_id, notes, due_date) VALUES (?, ?, ?, ?)',
      [user_id, equipment_id, notes, due_date]
    );
    return this.getById(result.insertId);
  },

  async returnEquipment(id, { due_date = new Date(), status = 'returned', notes }) {
    await db.query(
      'UPDATE borrowed_equipment SET due_date = ?, status = ?, notes = ? WHERE id = ?',
      [due_date, status, notes, id]
    );
    return this.getById(id);
  },

  async request({ user_id, equipment_id, notes, due_date }) {
    const [result] = await db.query(
      'INSERT INTO borrowed_equipment (user_id, equipment_id, notes, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, equipment_id, notes, due_date, 'pending']
    );
    return this.getById(result.insertId);
  },

  async delete(id) {
    await db.query('DELETE FROM borrowed_equipment WHERE id = ?', [id]);
  },

  async getPending() {
    const [rows] = await db.query("SELECT * FROM borrowed_equipment WHERE status = 'pending'");
    return rows;
  },

  async updateStatus(id, status) {
    await db.query('UPDATE borrowed_equipment SET status = ? WHERE id = ?', [status, id]);
    return this.getById(id);
  }
};

module.exports = BorrowedEquipment; 