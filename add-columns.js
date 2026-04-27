require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addColumns() {
    console.log('Adding columns...');
    
    try {
        await pool.query(`ALTER TABLE content ADD COLUMN IF NOT EXISTS start_time TIMESTAMP`);
        console.log('✅ start_time column added');
        
        await pool.query(`ALTER TABLE content ADD COLUMN IF NOT EXISTS end_time TIMESTAMP`);
        console.log('✅ end_time column added');
        
        console.log('🎉 Migration completed!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

addColumns();