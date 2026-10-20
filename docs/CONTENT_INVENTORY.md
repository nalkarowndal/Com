# 콘텐츠 전수 조사표 (CONTENT_INVENTORY.md)

프로젝트: `company` (PRISM)
기준 시점: 초기 베이스라인 상태 (Git commit `39ca3af`)
목적: 프로젝트 리팩토링 및 고도화 전 과정에서 원본 텍스트, 이미지, 순서의 무단 변형을 방지하고 100% 보존을 보장함.

---

## 1. 헤더 (Header)

| ID | 구분 | 원래 태그 / 속성 | 원본 데이터 (문자 단위 보존) | 리디자인 처리 규칙 |
|---|---|---|---|---|
| `HDR-LOGO-IMG` | 로고 이미지 | `<img src="images/logo.png" alt="Logo" class="style-logo">` | `src="images/logo.png"`, `alt="Logo"` | 이미지 원본 파일 보존, 경로를 `/images/logo.png`로 절대화, `alt="PRISM"` 지원(기존 alt 보존 가능) |
| `HDR-NAV-1` | 메뉴 1 | `<li><a href="#">Architecture</a></li>` | `Architecture` | 대소문자/철자 완전 일치. 활성 상태 지원 |
| `HDR-NAV-2` | 메뉴 2 | `<li><a href="#">Travel</a></li>` | `Travel` | 대소문자/철자 완전 일치. |
| `HDR-NAV-3` | 메뉴 3 | `<li><a href="#">Art</a></li>` | `Art` | 대소문자/철자 완전 일치. |
| `HDR-NAV-4` | 메뉴 4 | `<li><a href="#">Food</a></li>` | `Food` | 대소문자/철자 완전 일치. |

> **헤더 주의사항**: 메뉴 4개는 순서(`Architecture` → `Travel` → `Art` → `Food`)를 절대 바꾸지 않으며 임의의 메뉴를 추가하거나 삭제하지 않습니다.

---

## 2. 히어로 섹션 (Hero Section)

| ID | 구분 | 원래 태그 / 속성 | 원본 데이터 (문자 단위 보존) | 비고 |
|---|---|---|---|---|
| `HERO-BADGE` | 소분류/뱃지 | `<h3>Editor's Choice</h3>` | `Editor's Choice` | 아포스트로피 포함 원본 텍스트 유지 |
| `HERO-AUTHOR` | 작가/포토그래퍼 | `<h4>Sebastian Weiss</h4>` | `Sebastian Weiss` | 원본 이름 유지 |
| `HERO-TITLE` | 메인 타이틀 | `<h1>Urban Strorkes</h1>` | `Urban Strorkes` | **중요**: 원본의 오탈자 형태인 'Strorkes'를 절대 임의 수정하지 않음 |
| `HERO-BTN` | 액션 버튼 | `<a href="#" class="button">Read More</a>` | `Read More` | 대소문자 및 텍스트 유지 |
| `HERO-BG` | 배경 이미지 | `background-image:url(images/hero.jpg)` | `public/images/hero.jpg` | 원본 사진 유지, 반응형 레이아웃 및 최적화 오버레이 적용 |

---

## 3. 추천 기사 / 콘텐츠 카드 (Featured Content)

| ID | 카드 구분 | 원래 태그 / 속성 | 원본 데이터 (문자 단위 보존) | 비고 |
|---|---|---|---|---|
| `CARD-1-TITLE` | Tan Card (Box Tan) | `<h2>Inspring Reads</h2>` | `Inspring Reads` | **중요**: 원본의 'Inspring' 철자 그대로 보존 |
| `CARD-1-BODY` | Tan Card (Box Tan) | `<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus</p>` | `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus` | 쉼표 및 온점 포함 완전 보존 |
| `CARD-1-BTN` | Tan Card (Box Tan) | `<a href="" class="button">Read More</a>` | `Read More` | 텍스트 보존 |
| `CARD-2-TITLE` | Dark Card (Box Dark) | `<h2>Reflections</h2>` | `Reflections` | 대소문자 및 철자 보존 |
| `CARD-2-BODY` | Dark Card (Box Dark) | `<p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus</p>` | `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus` | 쉼표 및 온점 포함 완전 보존 |
| `CARD-2-BTN` | Dark Card (Box Dark) | `<a href="" class="button">Read More</a>` | `Read More` | 텍스트 보존 |

---

## 4. 갤러리 (Gallery)

| ID | 순서 | 원래 태그 / 속성 | 파일명 및 원본 자산 | 설명 / 검증 |
|---|---|---|---|---|
| `GAL-IMG-1` | 1 | `<img src="images/gallery-1.jpg" alt="" />` | `public/images/gallery-1.jpg` | 나선형 건축 계단 사진 보존 |
| `GAL-IMG-2` | 2 | `<img src="images/gallery-2.jpg" alt="" />` | `public/images/gallery-2.jpg` | 브루클린 다리 케이블 서스펜션 사진 보존 |
| `GAL-IMG-3` | 3 | `<img src="images/gallery-3.jpg" alt="" />` | `public/images/gallery-3.jpg` | 삼각 기하학 건축 지붕 사진 보존 |
| `GAL-IMG-4` | 4 | `<img src="images/gallery-4.jpg" alt="" />` | `public/images/gallery-4.jpg` | 곡면 고층 타워 파사드 사진 보존 |

> **갤러리 주의사항**: 4장의 사진은 순서(1 → 2 → 3 → 4)를 유지하며, 인공지능 생성 이미지나 다른 스톡 이미지로 대체하지 않습니다. 고도화 시 원본 이미지를 보여주는 Lightbox 모달과 적절한 웹 접근성 레이블을 부여합니다.

---

## 5. 푸터 (Footer)

| ID | 구분 | 원래 태그 / 속성 | 원본 데이터 (문자 단위 보존) | 비고 |
|---|---|---|---|---|
| `FTR-COPYRIGHT` | 저작권 표기 | `<p class="footer-text">2026 Green Systems Incorporated. All rights reserved.</p>` | `2026 Green Systems Incorporated. All rights reserved.` | 연도 및 기업명 임의 변경 금지 |
| `FTR-DESC` | 부가 설명 | `<p class="footer-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!</p>` | `Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!` | 느낌표 포함 원본 문구 보존 |

---

## 6. 기타 정적 자산 및 식별자

| 자산명 | 경로 | 설명 | 보존 방침 |
|---|---|---|---|
| 파비콘 | `public/favicon.svg` | 보라/파랑 그라데이션 SVG 아이콘 | 유지 |
| 아이콘 스프라이트 | `public/icons.svg` | Bluesky, Discord, GitHub, X 등의 심볼 정의 | 유지 |
| 미사용 이미지 | `src/assets/hero.png` | 13KB PNG 파일 | 삭제하지 않고 보존 |
| 타이틀 태그 | `index.html` `<title>company</title>` | 기본 타이틀 | `company` 프로젝트명 유지 및 SEO 보완 |

---

## 7. 불변성 서약 (Invariance Invariant)

1. 모든 텍스트 원문은 임의로 교정(Auto-correct), 윤색, 삭제, 추가하지 않는다.
2. 새로운 섹션(예: 팀 소개, 가격표, 문의 폼, FAQ 등)을 임의로 날조하지 않는다.
3. 이 목록은 `tests/snapshots/contentSnapshot.json`과 1:1로 동기화되며, 모든 단위 및 E2E 테스트에서 일치 여부를 자동 검증한다.
