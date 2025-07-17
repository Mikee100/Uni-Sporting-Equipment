const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./utils/db');
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const borrowedEquipmentRoutes = require('./routes/borrowedEquipment');
const penaltiesRoutes = require('./routes/penalties');
const usersRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrowed', borrowedEquipmentRoutes);
app.use('/api/penalties', penaltiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'University Sporting Equipment API is running.' });
});

// Database connection test route
app.get('/db-test', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ success: true, message: 'Database connection successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
