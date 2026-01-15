import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 모든 상품 조회
router.get('/', async (req, res) => {
    try {
        // active 상태인 상품만 보여줄지, 전체를 보여줄지는 쿼리 파라미터로 결정 가능하게?
        // 일단 관리 페이지에서는 다 보여야 하므로 조건 없이 조회
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('상품 조회 오류:', error);
        res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' });
    }
});

// 상품 추가
router.post('/', async (req, res) => {
    try {
        const { name, reg_months, price, description, active } = req.body;

        const result = await pool.query(
            `INSERT INTO products (name, reg_months, price, description, active)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, reg_months, price || 0, description, active !== undefined ? active : true]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('상품 추가 오류:', error);
        res.status(500).json({ error: '상품 추가 중 오류가 발생했습니다.' });
    }
});

// 상품 수정
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, reg_months, price, description, active } = req.body;

        const result = await pool.query(
            `UPDATE products 
             SET name = $1, reg_months = $2, price = $3, description = $4, active = $5
             WHERE id = $6
             RETURNING *`,
            [name, reg_months, price || 0, description, active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('상품 수정 오류:', error);
        res.status(500).json({ error: '상품 수정 중 오류가 발생했습니다.' });
    }
});

// 상품 삭제
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 해당 상품을 사용 중인 회원의 product_id를 NULL로 변경
        await pool.query('UPDATE users SET product_id = NULL WHERE product_id = $1', [id]);

        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }

        res.json({ message: '상품이 삭제되었습니다.' });
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({ error: '상품 삭제 중 오류가 발생했습니다.' });
    }
});

export default router;
