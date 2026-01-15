import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Client } = pg;

async function initializeDatabase() {
    console.log('🔧 데이터베이스 초기화를 시작합니다...\n');

    // 1. postgres 데이터베이스에 연결 (attendance_db가 없을 수 있으므로)
    const adminClient = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres', // 기본 데이터베이스
    });

    try {
        await adminClient.connect();
        console.log('✅ PostgreSQL 서버에 연결되었습니다.');

        // 2. attendance_db 데이터베이스 생성 (이미 존재하면 무시)
        const dbName = process.env.DB_NAME;
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
        const dbExists = await adminClient.query(checkDbQuery, [dbName]);

        if (dbExists.rows.length === 0) {
            await adminClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ 데이터베이스 '${dbName}'가 생성되었습니다.`);
        } else {
            console.log(`ℹ️  데이터베이스 '${dbName}'가 이미 존재합니다.`);
        }

        await adminClient.end();

        // 3. attendance_db에 연결하여 스키마 및 데이터 생성
        const appClient = new Client({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: dbName,
        });

        await appClient.connect();
        console.log(`✅ 데이터베이스 '${dbName}'에 연결되었습니다.\n`);

        // 4. 스키마 파일 실행
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
        await appClient.query(schemaSQL);
        console.log('✅ 데이터베이스 스키마가 생성되었습니다.');

        // 5. 시드 데이터 삽입
        const seedPath = path.join(__dirname, '../database/seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf-8');
        await appClient.query(seedSQL);
        console.log('✅ 샘플 데이터가 삽입되었습니다.');

        // 6. 데이터 확인
        const userCount = await appClient.query('SELECT COUNT(*) FROM users');
        const coachCount = await appClient.query('SELECT COUNT(*) FROM coaches');
        const attendanceCount = await appClient.query('SELECT COUNT(*) FROM attendance');

        // 7. admins 테이블 생성 및 초기 관리자 추가
        await appClient.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                name VARCHAR(50) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Admins 테이블 확인/생성 완료');

        // 초기 관리자 확인 및 생성 (admin / 1234)
        const adminCheck = await appClient.query("SELECT * FROM admins WHERE username = 'admin'");
        if (adminCheck.rows.length === 0) {
            // 비밀번호 1234 (실제 운영시에는 해시화 필요, 등 간단한 구현)
            // 여기서는 간단히 텍스트로 저장하거나, 추후 해시 적용. 
            // *중요*: 사용자가 "간단한 구조"를 원했으므로 평문 혹은 간단한 해시. 
            // 보안을 위해 최소한의 해시를 사용하는게 좋지만, backend에 bcrypt가 설치되어 있는지 확인 필요.
            // package.json 확인 결과 bcrypt 없음. 간단히 평문 저장 후 auth.js에서 비교 (간단한 구조 요청)
            // 혹은 uuid만 사용.
            await appClient.query(`
                INSERT INTO admins (username, password, name, role)
                VALUES ('admin', '1234', '관리자', 'super_admin')
            `);
            console.log('✅ 초기 관리자 계정 생성 (admin/1234)');
        }

        const adminCount = await appClient.query('SELECT COUNT(*) FROM admins');

        console.log('\n📊 데이터베이스 초기화 완료:');
        console.log(`   - 회원: ${userCount.rows[0].count}명`);
        console.log(`   - 코치: ${coachCount.rows[0].count}명`);
        console.log(`   - 관리자: ${adminCount.rows[0].count}명`);
        console.log(`   - 출석 기록: ${attendanceCount.rows[0].count}건`);

        await appClient.end();
        console.log('\n✨ 데이터베이스 초기화가 성공적으로 완료되었습니다!');
        console.log('💡 이제 "npm run dev" 명령으로 서버를 시작할 수 있습니다.\n');

    } catch (error) {
        console.error('❌ 데이터베이스 초기화 중 오류 발생:', error.message);
        process.exit(1);
    }
}

initializeDatabase();
