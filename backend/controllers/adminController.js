const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

exports.authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === 'admin-secret') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const { title, category, type } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = '/uploads/' + file.filename;
    const fileType = type || (file.mimetype.startsWith('video/') ? 'video' : 'photo');
    const id = await Gallery.create(
      title || file.originalname,
      '',
      fileType,
      filePath,
      category || 'Uncategorized',
      false
    );
    res.status(201).json({ message: 'File uploaded successfully', id, filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.findAll();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const items = await Gallery.findAll();
    const item = items.find(i => i.id == id);
    if (item) {
      const filePath = path.join(__dirname, '../../frontend/assets', item.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const db = require('../config/db');
    await db.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};