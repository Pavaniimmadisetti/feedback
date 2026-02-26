const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel');

async function ensureDefaultAdmin() {
  const username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const password = process.env.ADMIN_DEFAULT_PASSWORD || 'admin@123';

  const existing = await adminModel.findByUsername(username);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await adminModel.createDefaultAdmin(username, passwordHash);
}

module.exports = {
  ensureDefaultAdmin
};
