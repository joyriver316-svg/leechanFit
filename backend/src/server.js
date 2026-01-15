import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import pool from './config/database.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors()); // CORS 활성화 (프론트엔드 연결용)
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API 라우트 연결
app.use('/api', apiRoutes);

// 루트 경로
app.get('/', (req, res) => {
    res.json({
        message: '출석 관리 시스템 API 서버',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            coaches: '/api/coaches',
            attendance: '/api/attendance',
            health: '/api/health'
        }
    });
});

// 404 에러 핸들러
app.use((req, res) => {
    res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 오류:', err);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`\n🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📚 API 문서: http://localhost:${PORT}/api`);

    // 데이터베이스 연결 테스트
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ 데이터베이스 연결 실패:', err.message);
        } else {
            console.log('✅ 데이터베이스 연결 성공');
        }
    });
});
