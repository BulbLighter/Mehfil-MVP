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

async function runUp() {
  
  const appliedMigrations = await getAppliedMigrations();
  const pendingMigrations = getMigrationFiles().filter(file => !appliedMigrations.includes(file));
  console.log(`Applied migrations: ${appliedMigrations.length}`);
  console.log(`Found ${pendingMigrations.length} pending migrations`);
  console.log('Pending:', pendingMigrations);

  for (const file of pendingMigrations) {
    await applyMigration(file);
  }
  }

async function getLastAppliedMigration() {
  const result = await db.query('SELECT name FROM _migrations ORDER BY id DESC LIMIT 1');
  return result.rows[0] ? result.rows[0].name : null;
}

async function rollbackMigration(file) {
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const { down } = parseMigrationFile(sql);
  if (!down) throw new Error(`${file} has no -- DOWN section`);
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query(down);
    await client.query('DELETE FROM _migrations WHERE name = $1', [file]);
    await client.query('COMMIT');
    console.log(`Rolled back: ${file}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function runDown() {
  const last = await getLastAppliedMigration();
  if (!last) {
    console.log('Nothing to roll back');
    return;
  }
    await rollbackMigration(last);
}

async function run() {
  const command = process.argv[2] || 'up';
  if (command !== 'up' && command !== 'down') {
    throw new Error(`Unknown command "${command}". Use "up" or "down".`);
  }
  await ensureMigrationsTable();
  return command === 'up' ? runUp() : runDown();
}

function parseMigrationFile(sql){
  const [upPart, downPart = ''] = sql.split('-- DOWN');
  return { 
    up: upPart.replace('-- UP', '').trim(),
    down: downPart.trim() };
}
  

async function getAppliedMigrations() {
  const result = await db.query('SELECT name FROM _migrations ORDER BY name');
  return result.rows.map(row => row.name);
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