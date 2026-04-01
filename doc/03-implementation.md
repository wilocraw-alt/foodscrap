# 03. 구현

## v1 구현 (Python Flask)

### 핵심 파일
- `fetch_menu.py`: PDF 다운로드 + pymupdf 파싱
- `app.py`: Flask 서버 + SQLite 저장
- `templates/index.html`: 기본 UI

### 주요 함수
```python
def fetch_pdf():
    # 국회도서관에서 PDF 다운로드
    
def parse_pdf(pdf_path):
    # pymupdf로 텍스트 추출
    
def parse_menu(text):
    # 정규식으로 메뉴 파싱
```

## v2 구현 (GitHub Pages)

### 변경 사항
1. Flask 서버 제거
2. GitHub Actions 워크플로 추가
3. 정적 파일로 변환

### GitHub Actions 워크플로
```yaml
name: Fetch Weekly Menu
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 09:00 KST
jobs:
  fetch-menu:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Python
      - Install dependencies
      - Fetch menu data
      - Commit and push
```

### 프론트엔드 아키텍처
```javascript
// app.js 구조
let menuData = null;
let currentDayIndex = -1;

// 주요 함수
async function fetchMenu()     // JSON 로드
function render()              // UI 렌더링
function selectDay(index)      // 날짜 선택
function renderCard()          // 카드 생성
function getMenuEmoji()        // 이모지 매핑
```

## v3 구현 (디자인 개선)

### 변경 사항
1. 테마 색상 변경 (초록 → 시안)
2. 카드 레이아웃 추가
3. 탭 개선 (숫자 + 요일)
4. 이모지 자동 매핑
5. 반응형 디자인

### CSS 주요 클래스
```css
.header          // 헤더 (그라데이션)
.tabs            // 날짜 탭
.tab             // 개별 탭
.menu-card       // 메뉴 카드
.card-header     // 카드 헤더
.menu-item       // 메뉴 아이템
.menu-emoji      // 이모지
```

## v4 구현 (기능 강화)

### 변경 사항
1. `parseDateNum` 정규식 수정
2. 반응(emoji) 기능 추가
3. 하네스 파이프라인 적용

### 반응 기능 구현
```javascript
function react(btn) {
  const countEl = btn.querySelector('.count');
  let count = parseInt(countEl.textContent);
  if (btn.classList.contains('reacted')) {
    btn.classList.remove('reacted');
    countEl.textContent = count - 1;
  } else {
    btn.classList.add('reacted');
    countEl.textContent = count + 1;
  }
}
```

## v5 구현 (GitHub Issues 연동)

### 변경 사항
1. 반응 기능 제거
2. GitHub Issues API 연동
3. 식단 요청 게시판 추가

### GitHub Issues 연동
```javascript
async function fetchRecentRequests() {
  const resp = await fetch(
    'https://api.github.com/repos/wilocraw-alt/foodscrap/issues?labels=menu-request&per_page=5'
  );
  const issues = await resp.json();
  renderRequests(issues);
}

function openRequest() {
  window.open(
    'https://github.com/wilocraw-alt/foodscrap/issues/new?title=식단 요청: &labels=menu-request',
    '_blank'
  );
}
```

### template literal 이스케이프 오류 수정
**원인**: `\${}` → `${}` 이스케이프 해제 필요
**해결**: `sed -i 's/\\\${/\${/g' app.js`

### reactions 변수 미정의 오류 수정
**원인**: 반응 기능 제거 후 잔재 코드
**해결**: `renderCard()`에서 `${reactions}` 참조 제거

**작성일**: 2026-04-01
