import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/shotpilot.db');

const db = new Database(dbPath);

const email = 'test@shotpilot.com';
const password = 'testpassword123';
const credits = 20;
const tier = 'free';

const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Remove existing test user if present
db.prepare('DELETE FROM users WHERE email = ?').run(email);

// Insert test user
const result = db.prepare(
    'INSERT INTO users (email, password_hash, credits, tier) VALUES (?, ?, ?, ?)'
).run(email, passwordHash, credits, tier);

// Verify
const user = db.prepare('SELECT id, email, credits, tier, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

console.log('Test user created successfully:');
console.log(JSON.stringify(user, null, 2));

db.close();
