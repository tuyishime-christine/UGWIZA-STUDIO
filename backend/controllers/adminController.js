// Get all contact messages
exports.getMessages = async (req, res) => {
  try {
    const db = require('../config/db');
    const [rows] = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};