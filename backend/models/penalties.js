const db = require('../utils/db');

const Penalties = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM penalties');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM penalties WHERE id = ?', [id]);
    return rows[0];
  },

  async getByUser(user_id) {
    const [rows] = await db.query('SELECT * FROM penalties WHERE user_id = ?', [user_id]);
    return rows;
  },

  async create({ user_id, borrowed_equipment_id, amount, reason, status = 'unpaid' }) {
    const [result] = await db.query(
      'INSERT INTO penalties (user_id, borrowed_equipment_id, amount, reason, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, borrowed_equipment_id, amount, reason, status]
    );
    return this.getById(result.insertId);
  },

  async update(id, { amount, reason, status }) {
    await db.query(
      'UPDATE penalties SET amount = ?, reason = ?, status = ? WHERE id = ?',
      [amount, reason, status, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM penalties WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Penalties; 