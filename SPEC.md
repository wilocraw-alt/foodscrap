# Foodscrap v5 - SPECIFICATION

## 변경 사항

### 제거 항목
- 반응 바 (👍😋🔥) — 메뉴 항목/카드 하단에서 완전 제거
- 반응 관련 CSS (`.reaction-bar`, `.reaction-btn`, `.reacted`, `.count`)
- 반응 관련 JS (`react()`, `hashCount()`, `generateReactions()`)
- 카드 하단 `.card-footer` 전체 제거

### 추가 항목: 식단 요청 게시판

#### 개요
사용자가 새로운 식단/메뉴를 요청할 수 있는 게시판. 정적 사이트이므로 **GitHub Issues API**를 활용하여 댓글/요청을 수집.

#### 아키텍처
```
사용자 → "식단 요청하기" 버튼 클릭
  ↓
GitHub Issues API (repo: wilocraw-alt/foodscrap)
  ↓
이슈 생성 (label: "menu-request")
  ↓
메인 페이지에서 최근 요청 목록 표시
```

#### 구현 상세

1. **요청 버튼**
   - 카드 하단에 "💡 식단 요청하기" 버튼
   - 클릭 시 GitHub Issues 페이지로 이동 (새 이슈 생성 폼)
   - URL: `https://github.com/wilocraw-alt/foodscrap/issues/new?title=식단 요청: &labels=menu-request`

2. **최근 요청 목록**
   - 메인 페이지 하단에 "최근 요청" 섹션
   - GitHub Issues API로 label=menu-request 이슈 fetch
   - 제목 + 작성자 + 날짜 표시
   - 클릭 시 해당 이슈로 이동

3. **GitHub API 호출**
   - 공개 저장소이므로 토큰 없이 fetch 가능
   - URL: `https://api.github.com/repos/wilocraw-alt/foodscrap/issues?labels=menu-request&per_page=5`
   - 캐시: localStorage (1시간)

#### UI 배치
```
[오늘 식단 카드]
  ...

[💡 식단 요청하기]  ← 버튼

[최근 요청]
  • 메뉴명 (작성자, 3일 전)
  • 메뉴명 (작성자, 5일 전)
```

## 구현 파일 변경

### index.html
- 카드 영역 아래에 요청 버튼 + 최근 요청 섹션 추가

### style.css
- `.request-section` 스타일 추가
- `.request-list` 스타일 추가
- 반응 관련 CSS 제거

### app.js
- 반응 함수 제거 (`react`, `hashCount`, `generateReactions`)
- 반응 렌더링 제거 (`card-footer`, `menu-reactions`)
- `fetchRecentRequests()` 함수 추가
- `renderRequests()` 함수 추가

## 수용 기준
- [ ] 반응 이모지 완전 제거
- [ ] 요청 버튼이 GitHub Issues로 연결
- [ ] 최근 요청 목록이 API에서 로드
- [ ] API 실패 시 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 모바일 반응형 유지
