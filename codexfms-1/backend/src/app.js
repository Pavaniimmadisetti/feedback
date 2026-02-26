const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
