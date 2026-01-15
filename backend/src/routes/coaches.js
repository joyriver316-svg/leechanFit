import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 전체 코치 조회
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coaches ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('코치 조회 오류:', error);
        res.status(500).json({ error: '코치 조회 중 오류가 발생했습니다.' });
    }
});

// 특정 코치 조회
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM coaches WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '코치를 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('코치 조회 오류:', error);
        res.status(500).json({ error: '코치 조회 중 오류가 발생했습니다.' });
    }
});

export default router;
