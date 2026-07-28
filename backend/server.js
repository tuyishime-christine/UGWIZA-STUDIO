const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // <-- fs required here FIRST
const contactRoutes = require('./routes/contactRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
const app = express();

// ---- Configuration ----
const PORT = process.env.PORT || 5000;
const UPLOAD_DIR = path.resolve(__dirname, '../docs/assets/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory: ${UPLOAD_DIR}`);
}

// ---- ONE-TIME FILE RENAME & DEBUG SCRIPT ----
// This will run once on startup. Remove after successful deployment.
const renameFiles = () => {
  console.log('📁 Current files in upload directory:');
  const files = fs.readdirSync(UPLOAD_DIR);
  files.forEach(f => console.log('  -', f));

  let renamedCount = 0;
  files.forEach((file) => {
    let newFile = file;

    // 1. Fix image files: _JPG.jpg → .JPG, _jpg.jpg → .JPG
    if (file.endsWith('_JPG.jpg')) {
      newFile = file.replace(/_JPG\.jpg$/, '.JPG');
    } else if (file.endsWith('_jpg.jpg')) {
      newFile = file.replace(/_jpg\.jpg$/, '.JPG');
    } else if (file.endsWith('_JPG')) {
      newFile = file.replace(/_JPG$/, '.JPG');
    } else if (file.endsWith('_jpg')) {
      newFile = file.replace(/_jpg$/, '.JPG');
    }

    // 2. Fix video files: _mp4.mp4 → .mp4, _mp4 → .mp4
    if (file.endsWith('_mp4.mp4')) {
      newFile = file.replace(/_mp4\.mp4$/, '.mp4');
    } else if (file.endsWith('_mp4')) {
      newFile = file.replace(/_mp4$/, '.mp4');
    }

    // 3. If nothing matched, clean underscores/spaces from the name part
    if (newFile === file) {
      const ext = file.split('.').pop();
      const name = file.slice(0, file.lastIndexOf('.'));
      const cleanName = name.replace(/[_ ]/g, '');
      if (cleanName !== name) {
        newFile = cleanName + '.' + ext;
      }
    }

    if (newFile !== file) {
      const oldPath = path.join(UPLOAD_DIR, file);
      const newPath = path.join(UPLOAD_DIR, newFile);
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Renamed: ${file} → ${newFile}`);
        renamedCount++;
      } else {
        console.log(`⚠️ Target already exists: ${newFile} – skipping ${file}`);
      }
    }
  });

  console.log(`✅ Done – renamed ${renamedCount} file(s).`);
};

renameFiles();
// ---- END SCRIPT ----

// ---- Multer file upload configuration ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Get name without any extension, then sanitize
    const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
    const extension = file.originalname.split('.').pop();
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9\-_ ]/g, '_');
    cb(null, uniqueSuffix + '-' + cleanName + '.' + extension);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});

// ---- Middleware ----
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Serve static files with extension fallbacks
app.use('/uploads', express.static(UPLOAD_DIR, {
  extensions: ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'webp', 'mp4', 'MP4', 'mov', 'avi', 'mkv']
}));

// ---- Routes ----
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes(upload));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API server is running',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      gallery: '/api/gallery',
      admin: '/api/admin',
    },
  });
});

// ---- Error Handling ----
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[${new Date().toISOString()}] ${status} - ${message}`, err.stack);
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  console.log(`📁 Uploads directory: ${UPLOAD_DIR}`);
});