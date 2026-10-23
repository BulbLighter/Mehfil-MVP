const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function required(name) {
  if (!process.env[name]) throw new Error(`Missing ${name} — check your .env file`);
  return process.env[name];
}

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'mehfil_dev',
    password: required('DB_PASSWORD'),
    port: process.env.DB_PORT || 5432,
  },
};