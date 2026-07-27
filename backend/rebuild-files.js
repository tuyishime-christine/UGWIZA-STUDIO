const fs = require('fs');
const path = require('path');

// Ensure directories exist
['config', 'models', 'controllers', 'routes', 'utils', 'middleware'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// ---- config/db.js ----
fs.writeFileSync('config/db.js', `
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
`.trim(), 'utf8');

// ---- models/Contact.js ----
fs.writeFileSync('models/Contact.js', `
const db = require('../config/db');

const Contact = {
  create: async (name, email, phone, subject, message) => {
    const [result] = await db.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, subject, message]
    );
    return result.insertId;
  }
};

module.exports = Contact;
`.trim(), 'utf8');

// ---- models/Gallery.js ----
fs.writeFileSync('models/Gallery.js', `
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
`.trim(), 'utf8');

// ---- controllers/contactController.js ----
fs.writeFileSync('controllers/contactController.js', `
const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/emailService');

exports.submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  try {
    const contactId = await Contact.create(name, email, phone, subject, message);
    await sendEmail(name, email, subject, message);
    res.status(201).json({ message: 'Message sent successfully!', id: contactId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};
`.trim(), 'utf8');

// ---- controllers/galleryController.js ----
fs.writeFileSync('controllers/galleryController.js', `
const Gallery = require('../models/Gallery');

exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.findAll();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery.' });
  }
};

exports.getGalleryByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const items = await Gallery.findByCategory(category);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery by category.' });
  }
};
`.trim(), 'utf8');

// ---- controllers/adminController.js ----
fs.writeFileSync('controllers/adminController.js', `
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
`.trim(), 'utf8');

// ---- routes/contactRoutes.js ----
fs.writeFileSync('routes/contactRoutes.js', `
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.submitContact);

module.exports = router;
`.trim(), 'utf8');

// ---- routes/galleryRoutes.js ----
fs.writeFileSync('routes/galleryRoutes.js', `
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.get('/', galleryController.getGallery);
router.get('/category/:category', galleryController.getGalleryByCategory);

module.exports = router;
`.trim(), 'utf8');

// ---- routes/adminRoutes.js ----
fs.writeFileSync('routes/adminRoutes.js', `
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

module.exports = (upload) => {
  router.post('/login', adminController.login);
  router.post('/upload', adminController.authenticate, upload.single('file'), adminController.uploadFile);
  router.get('/gallery', adminController.authenticate, adminController.getGallery);
  router.delete('/gallery/:id', adminController.authenticate, adminController.deleteGalleryItem);
  return router;
};
`.trim(), 'utf8');

// ---- utils/emailService.js ----
fs.writeFileSync('utils/emailService.js', `
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (name, email, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: \`New Contact from \${name}: \${subject}\`,
    text: \`Name: \${name}\\nEmail: \${email}\\nMessage: \${message}\`,
  };
  await transporter.sendMail(mailOptions);
};
`.trim(), 'utf8');

// ---- middleware/auth.js ----
fs.writeFileSync('middleware/auth.js', `
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
`.trim(), 'utf8');

// ---- server.js (clean version) ----
fs.writeFileSync('server.js', `
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

dotenv.config();
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../frontend/assets/uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../frontend/assets/uploads')));

app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes(upload));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`.trim(), 'utf8');

console.log('✅ All backend files recreated with clean UTF‑8 without BOM!');
