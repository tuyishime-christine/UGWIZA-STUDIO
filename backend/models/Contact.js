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