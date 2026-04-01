# 07. 스킬 등록 정보

## 스킬 개요
- **이름**: 국회도서관 식단표 뷰어 (foodscrap)
- **버전**: v5
- **유형**: 정적 웹앱 (PWA)
- **플랫폼**: GitHub Pages

## 기술 사양

### 시스템 요구사항
- Python 3.11+ (크롤링용)
- Node.js 18+ (JavaScript 구문 검사용)
- GitHub 계정 (Actions 및 Pages용)
- gh CLI (GitHub API 접근용)

### 의존성
```
# Python (크롤링용)
requests
beautifulsoup4
pymupdf

# JavaScript (런타임)
없음 (Vanilla JS)
```

### 파일 구조
```
foodscrap/
├── .github/workflows/fetch-menu.yml  # 자동 수집
├── scripts/fetch_menu.py             # 크롤링 스크립트
├── data/menu.json                    # 식단 데이터
├── index.html                        # 메인 UI
├── app.js                            # 프론트엔드 로직
├── style.css                         # 스타일
├── sw.js                             # Service Worker
├── manifest.json                     # PWA 매니페스트
└── icon-*.png                        # PWA 아이콘
```

## 핵심 함수

### Python (크롤링)
```python
def fetch_pdf()      # 국회도서관에서 PDF 다운로드
def parse_pdf()      # pymupdf로 텍스트 추출
def parse_menu()     # 정규식으로 메뉴 파싱
```

### JavaScript (프론트엔드)
```javascript
async function fetchMenu()          # JSON 데이터 로드
function render()                   # UI 렌더링
function selectDay(index)           # 날짜 선택
function renderCard()               # 카드 생성
function getMenuEmoji()             # 이모지 매핑
async function fetchRecentRequests() # GitHub Issues 조회
function openRequest()              # Issues 생성 페이지 이동
```

## 설정

### GitHub Actions 워크플로
```yaml
name: Fetch Weekly Menu
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 09:00 KST
  workflow_dispatch:       # 수동 실행 가능
```

### 환경 변수
없음 (GitHub Actions에서 자동 실행)

### 캐시 설정
```javascript
const CACHE_KEY = 'foodscrap_menu';
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;  // 6시간
```

## API 엔드포인트

### GitHub Issues API
```
GET https://api.github.com/repos/{owner}/{repo}/issues?labels=menu-request&per_page=5
```

### GitHub Pages URL
```
https://wilocraw-alt.github.io/foodscrap/
```

## 배포 절차

### 1. 데이터 생성
```bash
pip install requests beautifulsoup4 pymupdf
python scripts/fetch_menu.py
```

### 2. GitHub 저장소 설정
```bash
gh repo create foodscrap --public --source=. --push
gh label create "menu-request" --color "0E8A16"
```

### 3. GitHub Pages 활성화
저장소 → Settings → Pages → Deploy from a branch (main/root)

### 4. 자동 수집 확인
Actions 탭 → Fetch Weekly Menu 워크플로 실행 확인

## 모니터링

### 상태 확인
```bash
# GitHub Pages 상태
curl -s -I https://wilocraw-alt.github.io/foodscrap/

# 데이터 상태
curl -s https://wilocraw-alt.github.io/foodscrap/data/menu.json

# Actions 워크플로 상태
gh run list --repo wilocraw-alt/foodscrap --limit 5
```

### 로그 확인
```bash
# 최근 실행 로그
gh run view --repo wilocraw-alt/foodscrap --log
```

## 문제 해결

### 일반적인 문제

#### 1. 페이지 로드 실패
- **증상**: "❌ 데이터 로드 실패" 표시
- **원인**: menu.json 없거나 JSON 형식 오류
- **해결**: `python scripts/fetch_menu.py` 실행 후 커밋

#### 2. 요청 목록 미표시
- **증상**: "아직 요청이 없습니다" 표시
- **원인**: `menu-request` 레이블 없음
- **해결**: `gh label create "menu-request"` 실행

#### 3. template literal 오류
- **증상**: "Cannot access 'reactions' before initialization"
- **원인**: `\${}` 이스케이프
- **해결**: `sed -i 's/\\\${/\${/g' app.js`

## 버전 히스토리

| 버전 | 커밋 | 변경사항 |
|------|------|----------|
| v1 | - | Python Flask 서버 |
| v2 | - | GitHub Pages 정적 호스팅 |
| v3 | - | 디자인 오버haul |
| v4 | - | 반응 기능, 탭 수정 |
| v5 | a0efa71 | 반응 제거, GitHub Issues 연동 |

**작성일**: 2026-04-01
