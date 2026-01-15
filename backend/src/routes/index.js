import express from 'express';
import usersRouter from './users.js';
import coachesRouter from './coaches.js';
import attendanceRouter from './attendance.js';
import uploadRouter from './upload.js';
import authRouter from './auth.js';
import adminsRouter from './admins.js';
import productsRouter from './products.js';

const router = express.Router();

// API 라우트 연결
router.use('/users', usersRouter);
router.use('/coaches', coachesRouter);
router.use('/attendance', attendanceRouter);
router.use('/upload', uploadRouter);
router.use('/auth', authRouter);
router.use('/admins', adminsRouter);
router.use('/products', productsRouter);

// 헬스 체크 엔드포인트
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

export default router;
