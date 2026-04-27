const db = require('../config/database');

class Content {
    static async create({ title, description, subject, file_url, file_type, file_size, uploaded_by }) {
        const result = await db.query(
            `INSERT INTO content (title, description, subject, file_url, file_type, file_size, uploaded_by, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
             RETURNING *`,
            [title, description, subject, file_url, file_type, file_size, uploaded_by]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query(
            `SELECT c.*, u.name as teacher_name 
             FROM content c
             LEFT JOIN users u ON c.uploaded_by = u.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByTeacher(teacherId) {
        const result = await db.query(
            `SELECT * FROM content WHERE uploaded_by = $1 ORDER BY created_at DESC`,
            [teacherId]
        );
        return result.rows;
    }

    static async getPendingApprovals() {
        const result = await db.query(
            `SELECT c.*, u.name as teacher_name 
             FROM content c
             LEFT JOIN users u ON c.uploaded_by = u.id
             WHERE c.status = 'pending'
             ORDER BY c.created_at ASC`
        );
        return result.rows;
    }

    static async updateStatus(id, status, approvedBy, rejectionReason = null) {
        const query = rejectionReason
            ? `UPDATE content SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3 WHERE id = $4 RETURNING *`
            : `UPDATE content SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = NULL WHERE id = $4 RETURNING *`;
        
        const params = rejectionReason 
            ? [status, approvedBy, rejectionReason, id]
            : [status, approvedBy, id];
        
        const result = await db.query(query, params);
        return result.rows[0];
    }

    static async getApprovedByTeacher(teacherId) {
        const result = await db.query(
            `SELECT * FROM content 
             WHERE uploaded_by = $1 AND status = 'approved'
             ORDER BY created_at DESC`,
            [teacherId]
        );
        return result.rows;
    }
}

module.exports = Content;