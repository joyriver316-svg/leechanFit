import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 전체 관리자 조회
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, name, role, created_at FROM admins ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('관리자 조회 오류:', error);
        res.status(500).json({ error: '관리자 조회 중 오류가 발생했습니다.' });
    }
});

// 관리자 추가
router.post('/', async (req, res) => {
    try {
        const { username, password, name, role } = req.body;

        // 아이디 중복 체크
        const check = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: '이미 존재하는 아이디입니다.' });
        }

        const result = await pool.query(
            `INSERT INTO admins (username, password, name, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, name, role, created_at`,
            [username, password, name, role || 'admin']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('관리자 등록 오류:', error);
        res.status(500).json({ error: '관리자 등록 중 오류가 발생했습니다.' });
    }
});

// 관리자 삭제
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 마지막 남은 슈퍼 관리자는 삭제 불가 등의 로직이 필요할 수 있음
        // 여기서는 간단히 구현

        const result = await pool.query('DELETE FROM admins WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ message: '사용자가 삭제되었습니다.' });
    } catch (error) {
        console.error('관리자 삭제 오류:', error);
        res.status(500).json({ error: '관리자 삭제 중 오류가 발생했습니다.' });
    }
});

export default router;
