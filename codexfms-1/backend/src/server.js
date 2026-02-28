require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');
const sessionModel = require('./models/sessionModel');
const { ensureDefaultAdmin } = require('./services/bootstrapService');

const port = Number(process.env.PORT || 5000);

async function start() {
  await pool.query('SELECT 1');
  await ensureDefaultAdmin();
  await sessionModel.removeExpired();

  app.listen(port, () => {
    console.log(`CFMS backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
