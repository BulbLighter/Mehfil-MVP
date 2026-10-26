const express = require('express');
const config = require('./config');

const app = express();
const port = config.port;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Mehfil backend is running on port ${port}`);
});