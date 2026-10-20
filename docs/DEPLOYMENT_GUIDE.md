# 배포 및 운영 가이드라인 (DEPLOYMENT_GUIDE.md)

프로젝트: `company` (PRISM)  
환경: Node.js 24.x LTS / React 19.x / Express 4.x

---

## 1. 사전 요구사항 (Prerequisites)

- **Node.js**: v24.16.0 LTS 이상
- **npm**: v11.x 이상
- **데이터베이스 (선택)**: PostgreSQL 14+ (미설치 시 자동으로 내장 영속 파일 데이터베이스로 작동)
- **브라우저**: Chrome / Edge / Firefox / Safari 최신 버전

---

## 2. 프로젝트 설치 (Installation)

### 2.1 저장소 루트 의존성 설치 (프론트엔드 & 테스트)
```bash
# 저장소 루트(company)에서 실행
npm install
```

### 2.2 백엔드 의존성 설치
```bash
# server 디렉터리에서 실행
cd server
npm install
cd ..
```

---

## 3. 환경 변수 설정 (Environment Setup)

`server/.env.example`을 복사하여 `server/.env`를 생성합니다:
```bash
cp server/.env.example server/.env
```

### 환경 변수 세부 항목
```env
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/company_db
JWT_SECRET=super_secret_editorial_prism_company_jwt_key_2026
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminSecurePassword2026!
```

> **참고**: `DATABASE_URL`에 접속할 수 없는 경우, 백엔드는 자동으로 내장 영속 파일 DB(`server/db/persistent_data.json`)로 복원력 있게 전환되어 모든 API와 기능을 정상 제공합니다.

---

## 4. 로컬 개발 환경 실행 (Development Mode)

### 터미널 1: 백엔드 API 서버 실행 (포트 4000)
```bash
npm run server
# 또는
cd server && npm run dev
```

- 헬스 체크 확인: `http://localhost:4000/api/health`
- 종합 홈 데이터 확인: `http://localhost:4000/api/home`

### 터미널 2: 프론트엔드 개발 서버 실행 (포트 5173)
```bash
npm run dev
```

- 웹 브라우저에서 `http://localhost:5173` 접속

---

## 5. 자동화 테스트 실행 (Testing)

```bash
# 1. 콘텐츠 무결성 단위 테스트 (스냅샷 1:1 비교)
npm run test:unit

# 2. 백엔드 REST API 통합 테스트
npm run test:api

# 3. Playwright 4대 뷰포트 & axe-core 접근성 E2E 테스트
npm run test:e2e
```

---

## 6. 프로덕션 빌드 및 배포 (Production Deployment)

### 6.1 프론트엔드 정적 번들 빌드
```bash
npm run build
```
- 빌드 결과물은 `dist/` 폴더에 생성됩니다.
- Nginx, AWS S3/CloudFront, Vercel, 또는 Express 정적 미들웨어를 통해 서빙 가능합니다.

### 6.2 백엔드 PM2 프로세스 관리 실행 (권장)
```bash
cd server
npx pm2 start src/server.js --name "company-prism-api" -i max
```
