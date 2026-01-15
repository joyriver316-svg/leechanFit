import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// 전체 회원 조회
router.get('/', async (req, res) => {
    try {
        const { type, search } = req.query;

        let query = 'SELECT * FROM users';
        const params = [];

        // 필터링 조건 추가
        if (type) {
            query += ' WHERE type = $1';
            params.push(type);
        }

        if (search) {
            const searchCondition = type ? ' AND' : ' WHERE';
            query += `${searchCondition} (name ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('회원 조회 오류:', error);
        res.status(500).json({ error: '회원 조회 중 오류가 발생했습니다.' });
    }
});

// 엑셀 다운로드 (반드시 /:id 라우트보다 먼저 정의)
router.get('/export', async (req, res) => {
    try {
        const { type } = req.query;

        let query = 'SELECT * FROM users';
        const params = [];

        if (type) {
            query += ' WHERE type = $1';
            params.push(type);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);

        // XLSX 라이브러리 import
        const XLSX = (await import('xlsx')).default;

        // 데이터를 엑셀 형식으로 변환
        const excelData = result.rows.map(user => ({
            'ID': user.id,
            '이름': user.name,
            '성별': user.gender,
            '전화번호': user.phone,
            '회원권 유형': user.type,
            '등록 개월': user.reg_months,
            '등록일': user.reg_date ? new Date(user.reg_date).toISOString().split('T')[0] : '',
            '시작일': user.start_date ? new Date(user.start_date).toISOString().split('T')[0] : '',
            '종료일': user.end_date ? new Date(user.end_date).toISOString().split('T')[0] : '',
            '잔여 횟수': user.remaining
        }));

        // 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '회원 목록');

        // 엑셀 파일 생성
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // 파일명 생성 (날짜 포함)
        const today = new Date().toISOString().split('T')[0];
        const filename = `회원목록_${today}.xlsx`;

        // 응답 헤더 설정
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    } catch (error) {
        console.error('엑셀 다운로드 오류:', error);
        res.status(500).json({ error: '엑셀 다운로드 중 오류가 발생했습니다.', details: error.message });
    }
});

// 엑셀 양식 다운로드
router.get('/template', async (req, res) => {
    try {
        const XLSX = (await import('xlsx')).default;

        // 샘플 데이터로 양식 생성
        const templateData = [
            {
                'ID': '301',
                '이름': '홍길동',
                '성별': '남',
                '전화번호': '010-1234-5678',
                '회원권 유형': 'FPT',
                '등록 개월': 12,
                '등록일': '2026-01-15',
                '시작일': '2026-01-15',
                '종료일': '2027-01-15',
                '잔여 횟수': 100
            },
            {
                'ID': '302',
                '이름': '김영희',
                '성별': '여',
                '전화번호': '010-2345-6789',
                '회원권 유형': 'PT',
                '등록 개월': 6,
                '등록일': '2026-01-15',
                '시작일': '2026-01-15',
                '종료일': '2026-07-15',
                '잔여 횟수': 50
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '회원 양식');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent('회원등록양식.xlsx') + '"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.send(buffer);
    } catch (error) {
        console.error('양식 다운로드 오류:', error);
        res.status(500).json({ error: '양식 다운로드 중 오류가 발생했습니다.', details: error.message });
    }
});

// 특정 회원 조회 (반드시 /export, /template 뒤에 정의)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('회원 조회 오류:', error);
        res.status(500).json({ error: '회원 조회 중 오류가 발생했습니다.' });
    }
});

// 회원 등록
router.post('/', async (req, res) => {
    try {
        const { id, name, gender, phone, type, regMonths, regDate, startDate, endDate, remaining } = req.body;

        const result = await pool.query(
            `INSERT INTO users (id, name, gender, phone, type, reg_months, reg_date, start_date, end_date, remaining)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [id, name, gender, phone, type, regMonths, regDate, startDate, endDate, remaining || 0]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('회원 등록 오류:', error);
        res.status(500).json({ error: '회원 등록 중 오류가 발생했습니다.' });
    }
});

// 회원 정보 수정
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, gender, phone, type, regMonths, regDate, startDate, endDate, remaining } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET name = $1, gender = $2, phone = $3, type = $4, reg_months = $5, 
                 reg_date = $6, start_date = $7, end_date = $8, remaining = $9, updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             RETURNING *`,
            [name, gender, phone, type, regMonths, regDate, startDate, endDate, remaining, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('회원 수정 오류:', error);
        res.status(500).json({ error: '회원 수정 중 오류가 발생했습니다.' });
    }
});

// 회원 삭제
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });
        }

        res.json({ message: '회원이 삭제되었습니다.', user: result.rows[0] });
    } catch (error) {
        console.error('회원 삭제 오류:', error);
        res.status(500).json({ error: '회원 삭제 중 오류가 발생했습니다.' });
    }
});

export default router;
