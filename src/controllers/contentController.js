const db = require('../config/database');
const upload = require('../middlewares/uploadMiddleware');
const fs = require('fs');

const uploadContent = (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'File required' });
        }
        
        let { title, subject, description, start_time, end_time, duration } = req.body;
        
        if (!title || !subject) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Title and subject required' });
        }
        
        if (!duration) duration = 5;
        
        try {
            const result = await db.query(
                `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9)
                 RETURNING id, title, subject, status, start_time, end_time`,
                [title, description || '', subject, req.file.path, req.file.mimetype, req.file.size, req.user.id, start_time || null, end_time || null]
            );
            
            const slot = await db.query('SELECT id FROM content_slots WHERE subject = $1', [subject]);
            
            if (slot.rows.length > 0) {
                const maxOrder = await db.query(
                    'SELECT COALESCE(MAX(rotation_order), 0) as max FROM content_schedule WHERE slot_id = $1',
                    [slot.rows[0].id]
                );
                
                await db.query(
                    `INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration)
                     VALUES ($1, $2, $3, $4)`,
                    [result.rows[0].id, slot.rows[0].id, maxOrder.rows[0].max + 1, parseInt(duration)]
                );
            }
            
            res.status(201).json({ content: result.rows[0] });
            
        } catch (dbErr) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ error: 'Upload failed' });
        }
    });
};

const getMyContent = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM content WHERE uploaded_by = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
};

module.exports = { uploadContent, getMyContent };