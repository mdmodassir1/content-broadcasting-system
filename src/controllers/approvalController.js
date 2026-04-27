const db = require('../config/database');

const getPending = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, u.name as teacher_name 
             FROM content c 
             JOIN users u ON c.uploaded_by = u.id 
             WHERE c.status = 'pending' 
             ORDER BY c.created_at`,
            []
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch' });
    }
};

const approve = async (req, res) => {
    try {
        const result = await db.query(
            `UPDATE content 
             SET status = 'approved', approved_by = $1, approved_at = NOW() 
             WHERE id = $2 AND status = 'pending' 
             RETURNING *`,
            [req.user.id, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        res.json({ content: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Approval failed' });
    }
};

const reject = async (req, res) => {
    const { reason } = req.body;
    
    if (!reason) {
        return res.status(400).json({ error: 'Rejection reason required' });
    }
    
    try {
        const result = await db.query(
            `UPDATE content 
             SET status = 'rejected', rejection_reason = $1, approved_by = $2, approved_at = NOW() 
             WHERE id = $3 AND status = 'pending' 
             RETURNING *`,
            [reason, req.user.id, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }
        
        res.json({ content: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Rejection failed' });
    }
};

module.exports = { getPending, approve, reject };