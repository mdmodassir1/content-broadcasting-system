require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/database');

async function seed() {
    const hash = await bcrypt.hash('Principal@123', 10);
    await db.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, 'principal')
         ON CONFLICT (email) DO NOTHING`,
        ['Principal Admin', 'principal@school.com', hash]
    );
    console.log('Principal seeded');
    process.exit();
}

seed();