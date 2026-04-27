require('dotenv').config();
const db = require('./src/config/database');

async function seedSchedule() {
    console.log('📅 Creating content schedules...\n');

    try {
        // Get teacher ID
        const teacher = await db.query(`SELECT id FROM users WHERE email = 'demo@teacher.com'`);
        const teacherId = teacher.rows[0].id;
        
        // Get slot_id for each subject
        const mathsSlot = await db.query(`SELECT id FROM content_slots WHERE subject = 'Maths'`);
        const scienceSlot = await db.query(`SELECT id FROM content_slots WHERE subject = 'Science'`);
        const englishSlot = await db.query(`SELECT id FROM content_slots WHERE subject = 'English'`);

        // Clear existing schedules
        await db.query(`DELETE FROM content_schedule`);
        console.log('🗑️ Cleared existing schedules');

        // Get all approved content
        const content = await db.query(
            `SELECT id, subject FROM content WHERE uploaded_by = $1 AND status = 'approved' ORDER BY subject, id`,
            [teacherId]
        );

        // Group content by subject
        const mathsContent = content.rows.filter(c => c.subject === 'Maths');
        const scienceContent = content.rows.filter(c => c.subject === 'Science');
        const englishContent = content.rows.filter(c => c.subject === 'English');

        // If only 1 content per subject, create dummy additional content for rotation demo
        if (mathsContent.length === 1) {
            // Create additional dummy content for Maths to show rotation
            const newContent = await db.query(
                `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
                 RETURNING id`,
                ['Maths Practice Test', 'Weekly test - Algebra', 'Maths', 'uploads/maths2.jpg', 'image/jpeg', 102400, teacherId, 1]
            );
            mathsContent.push({ id: newContent.rows[0].id, subject: 'Maths' });
            console.log('✅ Added extra Maths content for rotation demo');
        }

        if (scienceContent.length === 1) {
            const newContent = await db.query(
                `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
                 RETURNING id`,
                ['Science Lab Manual', 'Physics practical experiments', 'Science', 'uploads/science2.jpg', 'image/jpeg', 102400, teacherId, 1]
            );
            scienceContent.push({ id: newContent.rows[0].id, subject: 'Science' });
            console.log('✅ Added extra Science content for rotation demo');
        }

        if (englishContent.length === 1) {
            const newContent = await db.query(
                `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, approved_by, approved_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW())
                 RETURNING id`,
                ['English Literature', 'Shakespeare summary', 'English', 'uploads/english2.jpg', 'image/jpeg', 102400, teacherId, 1]
            );
            englishContent.push({ id: newContent.rows[0].id, subject: 'English' });
            console.log('✅ Added extra English content for rotation demo');
        }

        // Create schedules for Maths content (multiple)
        for (let i = 0; i < mathsContent.length; i++) {
            await db.query(
                `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
                 VALUES ($1, $2, $3, $4)`,
                [mathsContent[i].id, mathsSlot.rows[0].id, i + 1, 5]
            );
            console.log(`✅ Maths schedule: Order ${i + 1} - Content ID ${mathsContent[i].id}`);
        }

        // Create schedules for Science content (multiple)
        for (let i = 0; i < scienceContent.length; i++) {
            await db.query(
                `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
                 VALUES ($1, $2, $3, $4)`,
                [scienceContent[i].id, scienceSlot.rows[0].id, i + 1, 5]
            );
            console.log(`✅ Science schedule: Order ${i + 1} - Content ID ${scienceContent[i].id}`);
        }

        // Create schedules for English content (multiple)
        for (let i = 0; i < englishContent.length; i++) {
            await db.query(
                `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
                 VALUES ($1, $2, $3, $4)`,
                [englishContent[i].id, englishSlot.rows[0].id, i + 1, 5]
            );
            console.log(`✅ English schedule: Order ${i + 1} - Content ID ${englishContent[i].id}`);
        }

        console.log('\n🎉 Scheduling completed!');
        
        // Show summary
        const summary = await db.query(
            `SELECT cs.subject, COUNT(cs2.id) as content_count
             FROM content_slots cs
             LEFT JOIN content_schedule cs2 ON cs.id = cs2.slot_id
             GROUP BY cs.subject
             ORDER BY cs.subject`
        );
        console.log('\n📊 Schedule Summary:');
        summary.rows.forEach(row => {
            console.log(`   ${row.subject}: ${row.content_count} content(s) scheduled`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
        process.exit();
    }
}

seedSchedule();