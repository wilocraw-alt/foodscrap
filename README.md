# 🍽️ 국회도서관 식단표

국회도서관 주간식단표를 모바일 친화적으로 보여주는 PWA 웹앱.
**Python 서버 없이 GitHub Pages에서 순수 자바스크립트로 동작합니다.**

🔗 **Live**: https://wilocraw-alt.github.io/foodscrap/

---

## ✨ 주요 기능

- **📅 주간식단표**: 도서관식당 & 박물관식당 메뉴 (월~일)
- **📱 PWA 지원**: 홈화면에 추가, 오프라인 캐싱
- **🔄 자동 수집**: GitHub Actions가 매일 09:00 KST에 최신 식단 크롤링
- **💡 식단 요청**: GitHub Issues로 새 식당/메뉴 요청 가능
- **🎨 모바일 최적화**: 반응형 레이아웃, 이모지 자동 매핑

---

## 🏗️ 아키텍처

```
GitHub Actions (매일 09:00 KST)
  → 국회도서관 PDF 크롤링 + 파싱 (Python)
  → data/menu.json 커밋

GitHub Pages
  → 정적 파일 서빙 (HTML + JS + CSS + JSON)
  → 사용자 브라우저에서 렌더링
```

---

## 📁 파일 구조

```
foodscrap/
├── .github/workflows/
│   └── fetch-menu.yml        # GitHub Actions 자동 수집
├── scripts/
│   └── fetch_menu.py         # PDF 크롤링 + 파싱 스크립트
├── data/
│   └── menu.json             # 수집된 식단 데이터
├── index.html                # 메인 페이지
├── app.js                    # 프론트엔드 로직
├── style.css                 # 스타일
├── sw.js                     # Service Worker (PWA)
├── manifest.json             # PWA 매니페스트
├── icon-192.png              # PWA 아이콘 (192x192)
├── icon-512.png              # PWA 아이콘 (512x512)
└── icon-192.svg              # 아이콘 소스
```

---

## 🚀 배포 & 설정

### 1. GitHub 저장소 생성

```bash
gh repo create foodscrap --public --source=. --push
```

### 2. GitHub Pages 설정

저장소 → Settings → Pages:
- Source: **Deploy from a branch**
- Branch: **main** / **root**
- Save

### 3. 첫 데이터 생성

GitHub Actions 실행 전까지 menu.json이 없으므로 로컬에서 생성:

```bash
pip install requests beautifulsoup4 pymupdf
python scripts/fetch_menu.py
git add data/menu.json
git commit -m "🍱 Initial menu data"
git push
```

### 4. 식단 요청 레이블 설정

GitHub Issues 기반 요청 기능을 위해 `menu-request` 레이블 필요:

```bash
gh label create "menu-request" --color "0E8A16" --description "식단 요청"
```

### 5. 자동 수집 확인

Actions 탭 → `Fetch Weekly Menu` 워크플로 확인
수동 실행: Actions → Fetch Weekly Menu → Run workflow

---

## 💻 로컬 개발

```bash
# 데이터 생성
pip install requests beautifulsoup4 pymupdf
python scripts/fetch_menu.py

# HTTP 서버 실행
python3 -m http.server 8080

# 브라우저에서 접속
open http://localhost:8080
```

---

## 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Vanilla JS (ES6+), CSS3, HTML5 |
| 데이터 | JSON (GitHub Actions가 생성) |
| 백엔드 | Python 3.11 (크롤링용) |
| 배포 | GitHub Pages (정적 호스팅) |
| 자동화 | GitHub Actions (cron) |
| 캐싱 | localStorage + Service Worker |
| 요청 관리 | GitHub Issues API |

---

## 📋 버전 히스토리

| 버전 | 변경사항 |
|------|----------|
| v1 | Python Flask 서버 + 실시간 크롤링 |
| v2 | GitHub Pages 정적 호스팅 + Actions 자동 수집 |
| v3 | 디자인 오버haul (카드 레이아웃, 이모지, 탭) |
| v4 | 반응 기능, 탭 날짜 수정, PWA 개선 |
| **v5** | 반응 제거, 식단 요청 게시판 (GitHub Issues) |

---

## ⚠️ 제한사항

- 식단 데이터는 국회도서관 PDF 형식에 의존 (형식 변경 시 파싱 수정 필요)
- GitHub Actions 무료 플랜: 공개 레포 월 2,000분
- GitHub API 레이트 리밋: 비인증 60회/시간 (요청 목록 조회용)

---

## 📄 라이선스

MIT
