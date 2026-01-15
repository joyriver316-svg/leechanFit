import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 출석 기록 조회
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;

        let query = `
            SELECT a.*, u.name as user_name, p.name as user_type
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN products p ON u.product_id = p.id
        `;
        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`a.date >= $${params.length + 1}`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`a.date <= $${params.length + 1}`);
            params.push(endDate);
        }

        if (userId) {
            conditions.push(`a.user_id = $${params.length + 1}`);
            params.push(userId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.date DESC, a.time DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('출석 조회 오류:', error);
        res.status(500).json({ error: '출석 조회 중 오류가 발생했습니다.' });
    }
});

// 출석 체크 (신규 기록 생성)
router.post('/', async (req, res) => {
    try {
        const { userId, date, time, status } = req.body;

        // 회원 존재 여부 확인
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
        }

        const result = await pool.query(
            `INSERT INTO attendance (user_id, date, time, status)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, date, time, status || 'Present']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({ error: '이미 해당 시간에 출석 기록이 존재합니다.' });
        }
        console.error('출석 체크 오류:', error);
        res.status(500).json({ error: '출석 체크 중 오류가 발생했습니다.' });
    }
});

// 출석 통계
router.get('/stats', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                DATE(date) as attendance_date,
                COUNT(*) as total_count,
                COUNT(DISTINCT user_id) as unique_users
            FROM attendance
        `;
        const params = [];
        const conditions = [];

        if (startDate) {
            conditions.push(`date >= $${params.length + 1}`);
            params.push(startDate);
        }

        if (endDate) {
            conditions.push(`date <= $${params.length + 1}`);
            params.push(endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY DATE(date) ORDER BY attendance_date DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('출석 통계 조회 오류:', error);
        res.status(500).json({ error: '출석 통계 조회 중 오류가 발생했습니다.' });
    }
});

export default router;
