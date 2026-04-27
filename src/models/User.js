const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async create({ name, email, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, role]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query(
            `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async getAllTeachers() {
        const result = await db.query(
            `SELECT id, name, email, created_at FROM users WHERE role = 'teacher'`
        );
        return result.rows;
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;