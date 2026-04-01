# 🍽️ 국회도서관 식단표 v2

국회도서관 주간식단표를 모바일 친화적으로 보여주는 웹앱.
**Python 서버 없이 GitHub Pages에서 순수 자바스크립트로 동작합니다.**

## 아키텍처

```
GitHub Actions (매일 09:00 KST)
  → 국회도서관 크롤링 + PDF 파싱 (Python)
  → data/menu.json 커밋

GitHub Pages
  → 정적 파일 서빙 (index.html + app.js + data/menu.json)
  → 사용자 브라우저에서 로드 + 렌더링
```

## 배포 방법

### 1. GitHub 저장소 생성

```bash
gh repo create foodscrap --public --source=. --push
```

### 2. GitHub Pages 설정

GitHub 저장소 → Settings → Pages:
- Source: **Deploy from a branch**
- Branch: **main** / **root**
- Save

### 3. 수동으로 첫 데이터 생성

GitHub Actions가 실행되기 전까지 menu.json이 없으므로 로컬에서 생성:

```bash
pip install requests beautifulsoup4 pymupdf
python scripts/fetch_menu.py
git add data/menu.json
git commit -m "Initial menu data"
git push
```

### 4. 자동 수집 확인

GitHub Actions 탭에서 `Fetch Weekly Menu` 워크플로가 매일 실행되는지 확인.

수동 실행: Actions → Fetch Weekly Menu → Run workflow

## 로컬 개발

```bash
# 데이터 생성
pip install requests beautifulsoup4 pymupdf
python scripts/fetch_menu.py

# 서버 없이 열기 (file:// 프로토콜)
open index.html

# 또는 간단한 HTTP 서버
python3 -m http.server 8080
```

## 파일 구조

```
├── .github/workflows/
│   └── fetch-menu.yml      # GitHub Actions (매일 자동 수집)
├── scripts/
│   └── fetch_menu.py       # 수집 스크립트 (Actions에서 실행)
├── data/
│   └── menu.json           # 수집 결과 (Actions가 생성)
├── index.html              # 메인 UI
├── app.js                  # 프론트엔드 로직
├── style.css               # 스타일
├── manifest.json           # PWA 매니페스트
└── icon-192.svg            # 아이콘
```

## v1 → v2 변경사항

| v1 | v2 |
|---|---|
| Python Flask 서버 필요 | GitHub Pages 정적 서빙 |
| pymupdf 실시간 파싱 | Actions 사전 빌드 |
| SQLite DB | localStorage 캐시 |
| "새로고침" = 실시간 크롤링 | "재수집" = menu.json 재패치 |
| 로컬 PC에서만 접근 | 어디서든 접근 가능 |
| CORS 프록시 필요 | 같은 도메인, 문제없음 |

## 라이선스

MIT
