const express = require('express');
const config = require('./config');
const db = require('./db');
const { ERROR_CODES, sendError } = require('./utils/errors');

const app = express();
const port = config.port;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  await db.query('SELECT 1');
  res.json({ status: 'ok', db: 'ok' });
});

app.use((req, res) => {
  sendError(res, 404, ERROR_CODES.NOT_FOUND, `No route for ${req.method} ${req.path}`);
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  sendError(res, 500, ERROR_CODES.INTERNAL_ERROR, 'Something went wrong');
});

async function start() {
  try {
    await db.query('SELECT 1');
    app.listen(port, () => {
      console.log(`Mehfil backend is running on port ${port}`);
    });
  } catch (err) {
    console.error('Database startup check failed:', err.message);
    process.exit(1);
  }
}

start();
