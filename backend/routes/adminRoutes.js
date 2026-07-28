
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

module.exports = (upload) => {
  router.post('/login', adminController.login);
  router.post('/upload', adminController.authenticate, upload.single('file'), adminController.uploadFile);
  router.get('/gallery', adminController.authenticate, adminController.getGallery);
  router.delete('/gallery/:id', adminController.authenticate, adminController.deleteGalleryItem);
  router.get('/messages', adminController.authenticate, adminController.getMessages);
  // 👇 CLEAR route MUST come before /:id
  router.delete('/messages/clear', adminController.authenticate, adminController.clearMessages);
  router.delete('/messages/:id', adminController.authenticate, adminController.deleteMessage);

  return router;
};