const db = require('../config/database');

const getLiveContent = async (req, res) => {
    const teacherId = parseInt(req.params.teacherId);
    const subjectFilter = req.query.subject;
    const now = new Date();
    
    try {
        const teacher = await db.query('SELECT name FROM users WHERE id = $1 AND role = $2', [teacherId, 'teacher']);
        
        if (teacher.rows.length === 0) {
            return res.json({ success: true, activeContent: null });
        }
        
        let query = `
            SELECT c.id, c.title, c.description, c.subject, c.file_url, 
                   cs.duration, cs.rotation_order,
                   c.start_time, c.end_time
            FROM content c
            JOIN content_schedule cs ON c.id = cs.content_id
            WHERE c.uploaded_by = $1 
              AND c.status = 'approved'
              AND (c.start_time IS NULL OR c.start_time <= $2)
              AND (c.end_time IS NULL OR c.end_time >= $2)
        `;
        
        let params = [teacherId, now];
        
        if (subjectFilter) {
            query += ` AND c.subject = $3`;
            params.push(subjectFilter);
        }
        
        query += ` ORDER BY cs.rotation_order`;
        
        const schedules = await db.query(query, params);
        
        if (schedules.rows.length === 0) {
            return res.json({ success: true, activeContent: null });
        }
        
        const grouped = {};
        for (const row of schedules.rows) {
            if (!grouped[row.subject]) grouped[row.subject] = [];
            grouped[row.subject].push(row);
        }
        
        let target = subjectFilter;
        if (!target) {
            target = Object.keys(grouped)[0];
        }
        
        const contents = grouped[target];
        if (!contents) {
            return res.json({ success: true, activeContent: null });
        }
        
        const totalDuration = contents.reduce((sum, c) => sum + c.duration, 0);
        const minutesSinceEpoch = Math.floor(now.getTime() / 60000);
        const position = minutesSinceEpoch % totalDuration;
        
        let accumulated = 0;
        let activeItem = contents[0];
        
        for (let i = 0; i < contents.length; i++) {
            const item = contents[i];
            if (position >= accumulated && position < accumulated + item.duration) {
                activeItem = item;
                break;
            }
            accumulated += item.duration;
        }
        
        res.json({
            success: true,
            teacher: teacher.rows[0].name,
            subject: target,
            activeContent: {
                id: activeItem.id,
                title: activeItem.title,
                description: activeItem.description,
                subject: activeItem.subject,
                file_url: activeItem.file_url
            }
        });
        
    } catch (err) {
        res.json({ success: true, activeContent: null });
    }
};

module.exports = { getLiveContent };