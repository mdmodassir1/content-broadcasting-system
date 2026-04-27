require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./src/config/database');

async function seedTestData() {
    console.log('🌱 Seeding test data...\n');

    try {
        // 1. Create Teacher (if not exists)
        const teacherPassword = await bcrypt.hash('teacher123', 10);
        let teacher = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, name, email`,
            ['Demo Teacher', 'demo@teacher.com', teacherPassword, 'teacher']
        );

        let teacherId = 2;
        if (teacher.rows.length > 0) {
            teacherId = teacher.rows[0].id;
            console.log('✅ Teacher created with ID:', teacherId);
        } else {
            const existing = await db.query(`SELECT id FROM users WHERE email = 'demo@teacher.com'`);
            if (existing.rows.length > 0) {
                teacherId = existing.rows[0].id;
                console.log('ℹ️ Teacher already exists with ID:', teacherId);
            }
        }

        // 2. Delete existing approved content for this teacher (to avoid duplicates)
        await db.query(`DELETE FROM content WHERE uploaded_by = $1 AND status = 'approved'`, [teacherId]);
        console.log('🗑️ Cleared existing approved content');

        // 3. Create Approved Content 1 - Maths
        const content1 = await db.query(
            `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
             RETURNING id, title, subject`,
            ['Maths Question Paper', 'Annual Exam 2025 - Section A', 'Maths', 'uploads/maths.jpg', 'image/jpeg', 102400, teacherId, 1]
        );
        console.log('✅ Maths content created:', content1.rows[0]);

        // 4. Create Approved Content 2 - Science
        const content2 = await db.query(
            `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
             RETURNING id, title, subject`,
            ['Science Worksheet', 'Physics - Motion and Force', 'Science', 'uploads/science.jpg', 'image/jpeg', 102400, teacherId, 1]
        );
        console.log('✅ Science content created:', content2.rows[0]);

        // 5. Create Approved Content 3 - English
        const content3 = await db.query(
            `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
             RETURNING id, title, subject`,
            ['English Grammar', 'Tenses and Parts of Speech', 'English', 'uploads/english.jpg', 'image/jpeg', 102400, teacherId, 1]
        );
        console.log('✅ English content created:', content3.rows[0]);

        // 6. Verify
        const result = await db.query(
            `SELECT id, title, subject, status FROM content WHERE uploaded_by = $1`,
            [teacherId]
        );
        
        console.log('\n📊 Final Summary:');
        console.log(`   Teacher ID: ${teacherId}`);
        console.log(`   Total content created: ${result.rows.length}`);
        result.rows.forEach(row => {
            console.log(`   - ${row.title} (${row.subject}) [${row.status}]`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
        process.exit();
    }
}

seedTestData();