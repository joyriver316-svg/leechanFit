# 출석 관리 시스템 백엔드

출석 관리 시스템의 백엔드 API 서버입니다. Node.js, Express, PostgreSQL을 사용하여 구축되었습니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js (v18 이상)
- PostgreSQL (v17 이상)
- npm

### 설치 방법

1. **의존성 패키지 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   
   `.env` 파일을 열고 PostgreSQL 비밀번호를 설정하세요:
   ```env
   DB_PASSWORD=your_actual_password
   ```

3. **데이터베이스 초기화**
   ```bash
   npm run init-db
   ```
   
   이 명령은 다음을 수행합니다:
   - `attendance_db` 데이터베이스 생성
   - 테이블 스키마 생성 (users, coaches, attendance)
   - 샘플 데이터 삽입

4. **서버 실행**
   ```bash
   npm run dev
   ```
   
   서버가 `http://localhost:5000`에서 실행됩니다.

## 📚 API 문서

### 회원 관리 (Users)

#### 전체 회원 조회
```
GET /api/users
Query Parameters:
  - type: 회원 유형 필터 (FPT, PT, General, Group)
  - search: 이름 또는 전화번호 검색
```

#### 특정 회원 조회
```
GET /api/users/:id
```

#### 회원 등록
```
POST /api/users
Body: {
  "id": "301",
  "name": "홍길동",
  "gender": "남",
  "phone": "010-1234-5678",
  "type": "FPT",
  "regMonths": 12,
  "regDate": "2026-01-15",
  "startDate": "2026-01-15",
  "endDate": "2027-01-15",
  "remaining": 100
}
```

#### 회원 정보 수정
```
PUT /api/users/:id
Body: { ... } (등록과 동일한 필드)
```

#### 회원 삭제
```
DELETE /api/users/:id
```

### 코치 관리 (Coaches)

#### 전체 코치 조회
```
GET /api/coaches
```

#### 특정 코치 조회
```
GET /api/coaches/:id
```

### 출석 관리 (Attendance)

#### 출석 기록 조회
```
GET /api/attendance
Query Parameters:
  - startDate: 시작 날짜 (YYYY-MM-DD)
  - endDate: 종료 날짜 (YYYY-MM-DD)
  - userId: 특정 회원 ID
```

#### 출석 체크
```
POST /api/attendance
Body: {
  "userId": "101",
  "date": "2026-01-15",
  "time": "09:00",
  "status": "Present"
}
```

#### 출석 통계
```
GET /api/attendance/stats
Query Parameters:
  - startDate: 시작 날짜
  - endDate: 종료 날짜
```

### 헬스 체크
```
GET /api/health
```

## 🗂️ 프로젝트 구조

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # 데이터베이스 연결 설정
│   ├── routes/
│   │   ├── index.js          # 메인 라우터
│   │   ├── users.js          # 회원 관리 API
│   │   ├── coaches.js        # 코치 관리 API
│   │   └── attendance.js     # 출석 관리 API
│   └── server.js             # Express 서버 진입점
├── database/
│   ├── schema.sql            # 데이터베이스 스키마
│   └── seed.sql              # 샘플 데이터
├── scripts/
│   └── init-db.js            # 데이터베이스 초기화 스크립트
├── .env                      # 환경 변수
├── .gitignore
└── package.json
```

## 🔧 개발 명령어

- `npm start` - 프로덕션 모드로 서버 실행
- `npm run dev` - 개발 모드로 서버 실행 (파일 변경 시 자동 재시작)
- `npm run init-db` - 데이터베이스 초기화

## 🌐 프론트엔드 연동

프론트엔드에서 API를 사용하려면:

1. CORS가 이미 활성화되어 있습니다.
2. API Base URL: `http://localhost:5000/api`
3. 예시:
   ```javascript
   // 회원 목록 조회
   fetch('http://localhost:5000/api/users')
     .then(res => res.json())
     .then(data => console.log(data));
   ```

## 📝 데이터베이스 스키마

### users (회원)
- id, name, gender, phone, type
- reg_months, reg_date, start_date, end_date, remaining
- created_at, updated_at

### coaches (코치)
- id, name, phone, status, specialty
- created_at

### attendance (출석)
- id, user_id, date, time, status
- created_at

## 🐛 문제 해결

### 데이터베이스 연결 오류
- PostgreSQL 서버가 실행 중인지 확인
- `.env` 파일의 데이터베이스 비밀번호 확인
- 포트 5432가 사용 가능한지 확인

### 포트 충돌
- `.env` 파일에서 PORT 값을 변경

## 📄 라이선스

ISC
