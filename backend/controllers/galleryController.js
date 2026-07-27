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