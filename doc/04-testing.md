# 04. 테스트

## 테스트 환경

### 로컬 테스트
```bash
# 데이터 생성
python scripts/fetch_menu.py

# HTTP 서버 실행
python3 -m http.server 8080

# 브라우저 접속
open http://localhost:8080
```

### 배포 테스트
```bash
# GitHub Pages 확인
curl -s https://wilocraw-alt.github.io/foodscrap/

# JavaScript 구문 검사
node -c app.js

# 데이터 로드 확인
curl -s https://wilocraw-alt.github.io/foodscrap/data/menu.json
```

## 테스트 케이스

### 1. UI 렌더링 테스트
- [x] 7일 탭 정상 표시
- [x] 오늘 날짜 강조 (빨간 "Today")
- [x] 도서관식당 카드 표시
- [x] 박물관식당 카드 표시
- [x] 이모지 자동 매핑
- [x] 빈 메뉴 처리 ("영업을 하지 않습니다")

### 2. 상호작용 테스트
- [x] 탭 클릭 → 해당 날짜 메뉴 표시
- [x] 재수집 버튼 → 캐시 갱신
- [x] 식단 요청하기 버튼 → GitHub Issues 페이지 이동
- [x] 최근 요청 목록 표시

### 3. 데이터 테스트
- [x] menu.json 로드 성공
- [x] JSON 파싱 오류 없음
- [x] 캐시 동작 (localStorage)
- [x] 오프라인 동작 (Service Worker)

### 4. 반응형 테스트
- [x] 모바일 (375px) 레이아웃
- [x] 태블릿 (768px) 레이아웃
- [x] 가로 스크롤 탭

### 5. PWA 테스트
- [x] Service Worker 등록
- [x] manifest.json 로드
- [x] 아이콘 표시 (192px, 512px)
- [x] 홈화면 추가 가능

## 발견된 버그 & 수정

### 버그 #1: template literal 이스케이프
- **증상**: `Cannot access 'reactions' before initialization`
- **원인**: `\${}` 이스케이프로 인한 변수 미해석
- **수정**: `sed -i 's/\\\${/\${/g' app.js`
- **커밋**: `a0efa71`

### 버그 #2: reactions 변수 미정의
- **증상**: `Cannot access 'reactions' before initialization`
- **원인**: 반응 기능 제거 후 잔재 코드
- **수정**: `renderCard()`에서 `${reactions}` 참조 제거
- **커밋**: `a0efa71`

### 버그 #3: 요청 목록 미표시
- **증상**: "아직 요청이 없습니다" 표시
- **원인**: `menu-request` 레이블 없음
- **수정**: `gh label create "menu-request"` + 이슈에 레이블 추가
- **커밋**: 없음 (GitHub API 직접 수정)

## 테스트 결과 요약

| 구분 | 테스트 수 | 통과 | 실패 | 비고 |
|------|-----------|------|------|------|
| UI 렌더링 | 6 | 6 | 0 | |
| 상호작용 | 4 | 4 | 0 | |
| 데이터 | 4 | 4 | 0 | |
| 반응형 | 3 | 3 | 0 | |
| PWA | 4 | 4 | 0 | |
| **합계** | **21** | **21** | **0** | |

**작성일**: 2026-04-01
