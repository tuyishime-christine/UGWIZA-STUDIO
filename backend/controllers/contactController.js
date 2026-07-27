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