# 보안 점검 및 강화 보고서 (SECURITY_REVIEW.md)

작성일자: 2026-10-20  
프로젝트: `company` (PRISM)  
책임: Full-Stack Architect & Security Reviewer

---

## 1. 보안 진단 요약

| 점검 영역 | 기존 취약점 / 개선 필요 사항 | 적용된 보안 강화 조치 |
|---|---|---|
| **비밀번호 저장** | 단순 평문 비교 (`password === env.ADMIN_PASSWORD`) | `scrypt` 기반 Salt 단방향 해시 + `crypto.timingSafeEqual` 검증 |
| **토큰 검증** | `signature !== expectedSig` 타이밍 공격 노출 가능 | 버퍼 길이 일치 검사 및 `crypto.timingSafeEqual` 안전 비교 |
| **인증 세션** | 관리자 권한 없는 상태에서 관리자 UI 노출 위험 | `/admin/login` 기반 실제 백엔드 검증 + 보호 라우트 |
| **쿠키 보안** | 세션 토큰 저장 시 CSRF 취약 가능성 | `HttpOnly`, `SameSite=Strict`, `Secure`(운영환경) 쿠키 플래그 |
| **CORS 설정** | 개발용 전역 허용 | 허용된 화이트리스트 오리진으로 제한 |
| **보안 헤더** | Helmet 기본 적용 중 | CSP, X-Frame-Options, X-Content-Type-Options 정밀화 |
| **API Rate Limit** | 전역 500회/15분, 로그인 20회/15분 | 브루트 포스 방지 및 서비스 거부 공격 완화 |
| **비밀키 관리** | `.env.example`에 기본 비밀값 노출 | 안전한 플레이스홀더 (`YOUR_SECURE_SECRET_KEY`) 대체 |

---

## 2. 비밀번호 단방향 해싱 및 안전한 비교 구현 명세

### scrypt 해시 구조
- **Salt**: 16바이트 암호학적 난수 (`crypto.randomBytes(16)`)
- **Key Length**: 64바이트
- **형식**: `salt:derivedKeyHex`
- **검증 방식**:
  ```javascript
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(inputPassword, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  const match = crypto.timingSafeEqual(derivedKey, keyBuffer);
  ```

---

## 3. 토큰 서명 타이밍 공격 방지 (Timing Attack Mitigation)

```javascript
const signatureBuf = Buffer.from(signature, 'base64url');
const expectedBuf = Buffer.from(expectedSig, 'base64url');

if (signatureBuf.length !== expectedBuf.length) {
  return null;
}
if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
  return null;
}
```

---

## 4. 환경 변수 템플릿 보안 조치 (`server/.env.example`)

모든 예제 환경 변수에서 기본 패스워드를 제거하고 임의 생성 안내문을 명시합니다.

```env
PORT=4000
NODE_ENV=production
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/company_db
JWT_SECRET=REPLACE_WITH_MIN_64_CHAR_RANDOM_SECRET
ADMIN_USERNAME=admin
ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
```
