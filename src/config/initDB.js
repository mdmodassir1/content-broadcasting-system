require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
    console.log('📦 Creating tables...');

    const queries = [
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('teacher', 'principal')) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS content (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            subject VARCHAR(50) NOT NULL,
            file_url VARCHAR(500) NOT NULL,
            file_type VARCHAR(50) NOT NULL,
            file_size INTEGER NOT NULL,
            uploaded_by INTEGER,
            status VARCHAR(20) DEFAULT 'pending',
            rejection_reason TEXT,
            approved_by INTEGER,
            approved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS content_slots (
            id SERIAL PRIMARY KEY,
            subject VARCHAR(50) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE TABLE IF NOT EXISTS content_schedule (
            id SERIAL PRIMARY KEY,
            content_id INTEGER NOT NULL,
            slot_id INTEGER NOT NULL,
            rotation_order INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        `INSERT INTO content_slots (subject) VALUES 
            ('Maths'), ('Science'), ('English'), ('Social Studies'), ('Computer Science')
        ON CONFLICT (subject) DO NOTHING`
    ];

    try {
        for (let i = 0; i < queries.length; i++) {
            await pool.query(queries[i]);
            console.log(`✅ Query ${i + 1}/${queries.length} executed`);
        }
        console.log('🎉 All tables created successfully!');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

initDatabase();