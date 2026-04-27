const db = require('../config/database');

const getActiveContent = async (teacherId, subject) => {
    let query = `
        SELECT c.id, c.title, c.description, c.subject, c.file_url, cs.duration, cs.rotation_order
        FROM content c
        JOIN content_schedule cs ON c.id = cs.content_id
        WHERE c.uploaded_by = $1 AND c.status = 'approved'
    `;
    let params = [teacherId];
    
    if (subject) {
        query += ` AND c.subject = $2`;
        params.push(subject);
    }
    query += ` ORDER BY cs.rotation_order`;
    
    const result = await db.query(query, params);
    if (!result.rows.length) return null;
    
    const total = result.rows.reduce((sum, c) => sum + c.duration, 0);
    const now = new Date();
    const pos = Math.floor(now.getTime() / 60000) % total;
    
    let acc = 0;
    for (const row of result.rows) {
        if (pos >= acc && pos < acc + row.duration) return row;
        acc += row.duration;
    }
    return result.rows[0];
};

module.exports = { getActiveContent };