const db = require('../utils/db');

const Equipment = {
  async getAll(sport) {
    let query = 'SELECT * FROM equipment';
    let params = [];
    if (sport) {
      query += ' WHERE sport = ?';
      params.push(sport);
    }
    const [rows] = await db.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, description, quantity, status = 'available', sport = 'General' }) {
    const [result] = await db.query(
      'INSERT INTO equipment (name, description, quantity, status, sport) VALUES (?, ?, ?, ?, ?)',
      [name, description, quantity, status, sport]
    );
    return { id: result.insertId, name, description, quantity, status, sport };
  },

  async update(id, { name, description, quantity, status, sport }) {
    await db.query(
      'UPDATE equipment SET name = ?, description = ?, quantity = ?, status = ?, sport = ? WHERE id = ?',
      [name, description, quantity, status, sport, id]
    );
    return this.getById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM equipment WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Equipment; 