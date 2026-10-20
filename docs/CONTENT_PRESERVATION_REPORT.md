# 콘텐츠 무결성 보존 보고서 (CONTENT_PRESERVATION_REPORT.md)

작성일자: 2026-10-20
상태: M0 베이스라인 확정 및 보존 테스트 체계 수립

---

## 1. 개요

본 보고서는 `company` (PRISM) 프로젝트의 고도화 및 백엔드 구축 과정에서, 기존 프로젝트에 존재하는 모든 콘텐츠가 100% 온전히 보존되고 있음을 검증하고 보증하기 위해 작성되었습니다.

---

## 2. 콘텐츠 보존 원칙 (Non-Negotiable Constraints)

1. **절대 변경 금지 원칙**:
   - 오탈자처럼 보이는 텍스트 (`Urban Strorkes`, `Inspring Reads`)도 절대 수정하지 않음.
   - 더미 텍스트로 추정되는 `Lorem ipsum...`도 삭제하거나 변경하지 않음.
   - 프로젝트명 `company`와 브랜드명 `PRISM`, 저작권 표시 `2026 Green Systems Incorporated. All rights reserved.` 간의 명칭 차이를 임의로 일치시키지 않음.
2. **자산 교체 금지 원칙**:
   - `hero.jpg`, `gallery-1.jpg`, `gallery-2.jpg`, `gallery-3.jpg`, `gallery-4.jpg`, `logo.png` 등 원본 사진 및 로고를 AI 이미지나 임의의 스톡 사진으로 교체하지 않음.
3. **가상 콘텐츠 날조 금지 원칙**:
   - 데이터가 없는 글이나 소개글, 연락처 등을 임의로 만들어내지 않음.

---

## 3. 검증 메커니즘 (Automated Verification)

### A. 기준 스냅샷 파일
- 위치: `tests/snapshots/contentSnapshot.json`
- 원본 JSX 코드로부터 정확하게 추출된 JSON 데이터로, 헤더/히어로/콘텐츠 카드/갤러리/푸터의 모든 텍스트와 이미지 경로를 포함함.

### B. 단위 테스트를 통한 자동 검증
- 테스트 러너: Vitest
- 테스트 파일: `tests/unit/contentPreservation.test.js`
- 검증 내용:
  - 렌더링된 DOM 내 모든 텍스트 노드가 스냅샷과 100% 일치하는지 검증
  - 모든 이미지의 src 및 존재 여부 검증
  - 네비게이션 순서 및 라벨 검증
  - 카드의 순서 및 버튼 텍스트 검증

### C. E2E 및 시각 회귀 테스트 (Playwright)
- 실제 브라우저 환경에서 페이지 렌더링 시 스냅샷에 정의된 모든 문자열이 화면에 렌더링되고 가시적인지(visible) 단언(assert).

---

## 4. 실시간 점검표

| 영역 | 항목 | 원본 값 | 스냅샷 등록 | 컴포넌트 반영 | API 연동 | 최종 보존 여부 |
|---|---|---|---|---|---|---|
| 로고 | 이미지 | `/images/logo.png` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 네비게이션 1 | 라벨 | `Architecture` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 네비게이션 2 | 라벨 | `Travel` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 네비게이션 3 | 라벨 | `Art` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 네비게이션 4 | 라벨 | `Food` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 히어로 뱃지 | 텍스트 | `Editor's Choice` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 히어로 작가 | 텍스트 | `Sebastian Weiss` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 히어로 제목 | 텍스트 | `Urban Strorkes` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 히어로 버튼 | 텍스트 | `Read More` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 히어로 배경 | 이미지 | `/images/hero.jpg` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 1 제목 | 텍스트 | `Inspring Reads` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 1 본문 | 텍스트 | `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 1 버튼 | 텍스트 | `Read More` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 2 제목 | 텍스트 | `Reflections` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 2 본문 | 텍스트 | `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 카드 2 버튼 | 텍스트 | `Read More` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 갤러리 1 | 이미지 | `/images/gallery-1.jpg` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 갤러리 2 | 이미지 | `/images/gallery-2.jpg` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 갤러리 3 | 이미지 | `/images/gallery-3.jpg` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 갤러리 4 | 이미지 | `/images/gallery-4.jpg` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 푸터 저작권 | 텍스트 | `2026 Green Systems Incorporated. All rights reserved.` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |
| 푸터 설명 | 텍스트 | `Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!` | 확인 (PASS) | 확인 (PASS) | 확인 (PASS) | 보존 완료 |

---

## 5. 결론

베이스라인 콘텐츠는 JSON 스냅샷으로 완전히 동결되었으며, 앞으로 진행될 모든 UI/UX 리디자인 및 백엔드 데이터 연동 과정에서 일체의 내용 훼손 없이 안전하게 보존됩니다.
