const db = require('../utils/db');

const Equipment = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM equipment');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, description, quantity, status = 'available' }) {
    const [result] = await db.query(
      'INSERT INTO equipment (name, description, quantity, status) VALUES (?, ?, ?, ?)',
      [name, description, quantity, status]
    );
    return { id: result.insertId, name, description, quantity, status };
  },

  async update(id, { name, description, quantity, status }) {
    await db.query(
      'UPDATE equipment SET name = ?, description = ?, quantity = ?, status = ? WHERE id = ?',
      [name, description, quantity, status, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Equipment; 