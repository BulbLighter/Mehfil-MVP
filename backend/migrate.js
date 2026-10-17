const db = require('./db');

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');

function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  console.log('_migrations table ready');
}

async function applyMigration(file) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const { up } = parseMigrationFile(sql);
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(up);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
    await client.query('COMMIT');
    console.log(`Applied: ${file}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function run() {
  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();
  const pendingMigrations = getMigrationFiles().filter(file => !appliedMigrations.includes(file));
  console.log(`Applied migrations: ${appliedMigrations.length}`);
  console.log(`Found ${pendingMigrations.length} pending migrations`);
  console.log('Pending:', pendingMigrations);

  for (const file of pendingMigrations) {
    await applyMigration(file);
  }
  }

function parseMigrationFile(sql){
  const [upPart, downPart = ''] = sql.split('-- DOWN');
  return { 
    up: upPart.replace('-- UP', '').trim(),
    down: downPart.trim() };
}

run()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch(err => {
        console.error('Error running migrations:', err);
        process.exit(1);
});
  

async function getAppliedMigrations() {
  const result = await db.query('SELECT name FROM _migrations ORDER BY name');
  return result.rows.map(row => row.name);
}