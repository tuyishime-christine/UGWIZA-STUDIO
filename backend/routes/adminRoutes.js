const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

module.exports = (upload) => {
  // Admin login
  router.post('/login', adminController.login);

  // Upload file (protected)
  router.post('/upload', adminController.authenticate, upload.single('file'), adminController.uploadFile);

  // Gallery management
  router.get('/gallery', adminController.authenticate, adminController.getGallery);
  router.delete('/gallery/:id', adminController.authenticate, adminController.deleteGalleryItem);

  // Messages management
  router.get('/messages', adminController.authenticate, adminController.getMessages);
  router.delete('/messages/:id', adminController.authenticate, adminController.deleteMessage);
  router.delete('/messages/clear', adminController.authenticate, adminController.clearMessages); // 👈 Clear all

  return router;
};