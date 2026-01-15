import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 조회
        // *주의*: 현재는 평문 비밀번호를 사용합니다. 
        // 실제 운영 환경에서는 bcrypt 등을 사용하여 해시된 비밀번호를 비교해야 합니다.
        const result = await pool.query(
            'SELECT * FROM admins WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const admin = result.rows[0];

        // 성공 시 사용자 정보 반환 (비밀번호 제외)
        res.json({
            id: admin.id,
            username: admin.username,
            name: admin.name,
            role: admin.role
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

export default router;
