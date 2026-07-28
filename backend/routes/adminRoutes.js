const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

module.exports = (upload) => {
  // Admin login
  router.post('/login', adminController.login);

  // Upload file (protected)
  router.post('/upload', adminController.authenticate, upload.single('file'), adminController.uploadFile);

  // Get all gallery items
  router.get('/gallery', adminController.authenticate, adminController.getGallery);

  // Delete gallery item
  router.delete('/gallery/:id', adminController.authenticate, adminController.deleteGalleryItem);

  // 👇 NEW ROUTE: Get all contact messages
  router.get('/messages', adminController.authenticate, adminController.getMessages);

  return router;
};