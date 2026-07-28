const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

dotenv.config();
const app = express();

// ---- File upload configuration ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ✅ Changed from 'frontend' to 'docs'
    const uploadPath = path.join(__dirname, '../docs/assets/uploads');
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

// ---- Middleware ----
app.use(cors());
app.use(express.json());
// ✅ Changed static file serving path to 'docs'
app.use('/uploads', express.static(path.join(__dirname, '../docs/assets/uploads')));

// ---- Routes ----
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);

// ---- Admin Routes ----
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes(upload));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});