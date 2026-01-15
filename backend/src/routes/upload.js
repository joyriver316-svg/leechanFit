import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import pool from '../config/database.js';

const router = express.Router();

// 메모리에 파일 저장 (디스크에 저장하지 않음)
const upload = multer({ storage: multer.memoryStorage() });

// 엑셀 파일 업로드 및 회원 데이터 일괄 등록
router.post('/upload-users', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
        }

        // 엑셀 파일 파싱
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ error: '엑셀 파일에 데이터가 없습니다.' });
        }

        // 데이터 검증 및 변환
        const users = data.map((row, index) => {
            // 필수 필드 확인
            if (!row.id || !row.name || !row.type) {
                throw new Error(`${index + 2}번째 행: ID, 이름, 회원권 유형은 필수입니다.`);
            }

            return {
                id: String(row.id),
                name: String(row.name),
                gender: row.gender || null,
                phone: row.phone || null,
                type: String(row.type),
                regMonths: row.regMonths || row.reg_months || 0,
                regDate: row.regDate || row.reg_date || null,
                startDate: row.startDate || row.start_date || null,
                endDate: row.endDate || row.end_date || null,
                remaining: row.remaining || 0
            };
        });

        // 데이터베이스에 일괄 삽입
        const client = await pool.connect();
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        try {
            await client.query('BEGIN');

            for (const user of users) {
                try {
                    await client.query(
                        `INSERT INTO users (id, name, gender, phone, type, reg_months, reg_date, start_date, end_date, remaining)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                         ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            gender = EXCLUDED.gender,
                            phone = EXCLUDED.phone,
                            type = EXCLUDED.type,
                            reg_months = EXCLUDED.reg_months,
                            reg_date = EXCLUDED.reg_date,
                            start_date = EXCLUDED.start_date,
                            end_date = EXCLUDED.end_date,
                            remaining = EXCLUDED.remaining,
                            updated_at = CURRENT_TIMESTAMP`,
                        [user.id, user.name, user.gender, user.phone, user.type,
                        user.regMonths, user.regDate, user.startDate, user.endDate, user.remaining]
                    );
                    successCount++;
                } catch (err) {
                    errorCount++;
                    errors.push({ id: user.id, name: user.name, error: err.message });
                }
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        res.json({
            message: '엑셀 데이터 업로드 완료',
            total: users.length,
            success: successCount,
            failed: errorCount,
            errors: errors
        });

    } catch (error) {
        console.error('엑셀 업로드 오류:', error);
        res.status(500).json({
            error: '엑셀 업로드 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 엑셀 파일 업로드 및 출석 데이터 일괄 등록
router.post('/upload-attendance', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ error: '엑셀 파일에 데이터가 없습니다.' });
        }

        // 데이터 검증 및 변환
        const attendanceRecords = data.map((row, index) => {
            if (!row.userId || !row.user_id || !row.date) {
                throw new Error(`${index + 2}번째 행: 회원ID와 날짜는 필수입니다.`);
            }

            return {
                userId: row.userId || row.user_id,
                date: row.date,
                time: row.time || '09:00',
                status: row.status || 'Present'
            };
        });

        // 데이터베이스에 일괄 삽입
        const client = await pool.connect();
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        try {
            await client.query('BEGIN');

            for (const record of attendanceRecords) {
                try {
                    await client.query(
                        `INSERT INTO attendance (user_id, date, time, status)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (user_id, date, time) DO NOTHING`,
                        [record.userId, record.date, record.time, record.status]
                    );
                    successCount++;
                } catch (err) {
                    errorCount++;
                    errors.push({ userId: record.userId, date: record.date, error: err.message });
                }
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        res.json({
            message: '출석 데이터 업로드 완료',
            total: attendanceRecords.length,
            success: successCount,
            failed: errorCount,
            errors: errors
        });

    } catch (error) {
        console.error('출석 데이터 업로드 오류:', error);
        res.status(500).json({
            error: '출석 데이터 업로드 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 엑셀 템플릿 다운로드 가이드
router.get('/template-info', (req, res) => {
    res.json({
        users: {
            description: '회원 데이터 업로드용 엑셀 템플릿',
            requiredColumns: ['id', 'name', 'type'],
            optionalColumns: ['gender', 'phone', 'regMonths', 'regDate', 'startDate', 'endDate', 'remaining'],
            example: {
                id: '301',
                name: '홍길동',
                gender: '남',
                phone: '010-1234-5678',
                type: 'FPT',
                regMonths: 12,
                regDate: '2026-01-15',
                startDate: '2026-01-15',
                endDate: '2027-01-15',
                remaining: 100
            }
        },
        attendance: {
            description: '출석 데이터 업로드용 엑셀 템플릿',
            requiredColumns: ['userId', 'date'],
            optionalColumns: ['time', 'status'],
            example: {
                userId: '101',
                date: '2026-01-15',
                time: '09:00',
                status: 'Present'
            }
        }
    });
});

export default router;
