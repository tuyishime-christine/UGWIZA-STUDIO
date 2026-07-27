const db = require('../config/db');

const Gallery = {
  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    return rows;
  },
  findByCategory: async (category) => {
    const [rows] = await db.query('SELECT * FROM gallery WHERE category = ?', [category]);
    return rows;
  },
  create: async (title, description, type, filePath, category, featured) => {
    const [result] = await db.query(
      'INSERT INTO gallery (title, description, type, file_path, category, featured) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, type, filePath, category, featured || false]
    );
    return result.insertId;
  }
};

module.exports = Gallery;