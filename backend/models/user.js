const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async create({ name, email, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return { id: result.insertId, name, email, role };
  },

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  async getAll() {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users');
    return rows;
  },

  async getById(id) {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, { name, email, role }) {
    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    return this.getById(id);
  },

  async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return { id };
  },

  async getByRole(role) {
    const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE role = ?', [role]);
    return rows;
  },
};

module.exports = User; 