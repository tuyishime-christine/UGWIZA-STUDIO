const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/emailService');

exports.submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    // 1. Save the message to the database (this always happens)
    const contactId = await Contact.create(name, email, phone, subject, message);
    console.log('Contact saved to DB, ID:', contactId);

    // 2. Try to send the email (but don't let it break the response)
    //    We use a separate try-catch and don't await it to avoid blocking.
    sendEmail(name, email, subject, message)
      .then(() => console.log('Email sent successfully'))
      .catch(err => console.error('Email sending failed (non-blocking):', err.message));

    // 3. Return success to the frontend immediately
    res.status(201).json({ message: 'Message sent successfully!', id: contactId });

  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ error: 'Failed to save message.' });
  }
};