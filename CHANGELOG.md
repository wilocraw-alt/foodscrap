# 📋 Foodscrap 프로젝트 전체 문서

## 📊 버전 히스토리

| 버전 | 날짜 | 주요 변경사항 | 상태 |
|------|------|---------------|------|
| v1 | 2026.04.01 | Python Flask 서버 + 실시간 국회도서관 PDF 크롤링 | ✅ 완료 |
| v2 | 2026.04.01 | GitHub Pages 정적 호스팅 + Actions 자동 수집 | ✅ 완료 |
| v3 | 2026.04.01 | 디자인 오버haul (시안 테마, 카드 레이아웃, 이모지) | ✅ 완료 |
| v4 | 2026.04.01 | 하네스 적용, 탭/반응 기능 개선, PWA 완성 | ✅ 완료 |

---

## 🏗️ 아키텍처 변화

### v1: Python 서버 기반
```
Flask 서버 (localhost:8080)
  ↓ 실시간 크롤링
국회도서관 → PDF 다운로드 → pymupdf 파싱 → SQLite 저장
```

### v2: 정적 사이트 + 자동 수집
```
GitHub Actions (매일 09:00 KST)
  ↓ 크롤링 + 파싱
data/menu.json 생성 → Git 커밋
  ↓ GitHub Pages 서빙
브라우저 → JSON fetch → 렌더링
```

### v3: 디자인 개선
- 테마: 초록색 → 시안/하늘색 그라데이션
- 탭: 숫자 → 숫자+요일
- 카드: 리스트 → 헤더+바디 구조
- 이모지 자동 매핑 추가
- PWA 지원

### v4: 기능 강화
- 탭 날짜 표시 오류 수정 (`parseDateNum` 정규식)
- 반응(👍😋🔥) 기능 추가: 클릭 토글 + 로컬 저장
- 댓글 카운트 표시 제거
- 하네스 3-Agent 파이프라인 적용

---

## 🔧 하네스 적용 기록

### Planner 에이전트
- **SPEC.md** 작성: 디자인 명세, 컴포넌트 구조, 구현 태스크
- Input: CONTEXT.md, 참고 이미지 (ref_design_1/2.jpg), 현재 코드 파일
- Output: 260401_foodscrap-v2/SPEC.md

### Generator 에이전트
- SPEC.md 따라 구현:
  - `style.css`: 탭/카드/반응 스타일 추가
  - `index.html`: date-title 컨테이너 추가
  - `app.js`: `parseDateNum` 수정, `react()` 함수 추가, `renderCard()` 개선
- Output: SELF_CHECK.md

### Evaluator 에이전트
- QA_REPORT.md 작성
- 점수: 8.5/10 (CONDITIONAL)
- 발견 결함: 탭 날짜 불일치, 반응 하드코딩
- **재평가 및 수정** 후 재평가 진행

---

## 📝 현재 구현 상태

### ✅ 완료된 기능
1. **GitHub Pages 배포**: https://wilocraw-alt.github.io/foodscrap/
2. **PWA**: service worker, 오프라인 캐싱, 홈화면 추가 가능
3. **주간식단표 7일**: PDF → JSON 자동 파싱 (Actions 매일 09:00)
4. **모바일 반응형**: max-width 430px
5. **이모지 자동 매핑**: 국→🍲, 밥→🍚, 면→🍜, 샐러드→🥗, 생선→🐟 등
6. **반응 기능**: 👍, 😋, 🔥 이모지 클릭 토글, 상태 저장
7. **오늘 표시**: 현재 요일에 "Today" 빨간 라벨
8. **재수집 버튼**: 캐시 무시하고 menu.json 재패치
9. **Last Updated**: AM/PM 형식 시간 표시

### ⚠️ 제한사항
- 시간 뱃지: 정적 "11:30 ~ 13:30" (실제 시간 데이터 없음)
- English 자막: 없음 (한국어만)
- Pull-to-refresh: 미지원
- 댓글 본문: 아이콘만 표시, 상세 보기 없음

---

## 🧪 적용된 주요 수정사항 (issue → fix)

| issue | 원인 | fix |
|-------|------|-----|
| 탭에 월 숫자 표시 | `parseDateNum` regex `(\d{1,2})\.`가 월 추출 | `\d+\.(\d{1,2})`로 수정 → 일 추출 |
| 반응 하드코딩 | `<span>👍 12</span>` 고정 | `react()` 함수로 토글 구현, count 동적 변화 |
| 반응 활성 스타일 없음 | CSS `.reacted` 미정의 | `.reaction-btn.reacted` 스타일 추가 |
| 카드 내 메뉴 이모지 | 없음 | `getMenuEmoji()` 키워드 매칭 추가 |

---

## 🚀 배포 정보

- **GitHub 저장소**: https://github.com/wilocraw-alt/foodscrap
- **GitHub Pages**: https://wilocraw-alt.github.io/foodscrap/
- **최신 커밋**: `4f32250` - fix: 탭 날짜 정확히 표시 + 반응 실제 동작 구현
- **Actions 워크플로**: `.github/workflows/fetch-menu.yml`
- **데이터**: `data/menu.json` (6시간 캐시)

---

## 📁 파일 구조

```
260401_foodscrap-v2/
├── .github/workflows/fetch-menu.yml  # 매일 자동 수집
├── harness/agents/                   # 하네스 에이전트 지시서
│   ├── planner.md
│   ├── generator.md
│   ├── evaluator.md
│   └── evaluation_criteria.md
├── scripts/fetch_menu.py             # PDF 파싱 스크립트
├── data/menu.json                    # 수집된 메뉴 데이터
├── index.html                        # 메인 UI
├── app.js                            # 프론트엔드 로직
├── style.css                         # 스타일
├── manifest.json                     # PWA 매니페스트
├── icon-192.png, icon-512.png       # PWA 아이콘
├── sw.js                             # Service Worker
├── SPEC.md, SELF_CHECK.md, QA_REPORT.md  # 하네스 산출물
├── CONTEXT.md, CHANGELOG.md         # 문서
├── ref_design_1.jpg, ref_design_2.jpg  # 참고 스크린샷
└── doc/                             # 하네스 디렉토리 (자동 생성)
```

---

## 🔄 개발 워크플로우

1. **Planner**: `SPEC.md` 작성 → 디자인/기능 명세
2. **Generator**: `SPEC.md` 따라 구현 → `index.html`, `style.css`, `app.js` 수정 → `SELF_CHECK.md`
3. **Evaluator**: 코드 검토 → `QA_REPORT.md` 작성 → Go/No-Go 판정
4. **반복**: 조건부/불합격 시 피드백 반영 후 Generator 재실행 (최대 3회)
5. **배포**: `git push` → GitHub Pages 자동 배포

---

## 📚 참고 링크

- 하네스 가이드: `/home/wilowisp/.openclaw/workspace/AGENTS.md`
- OpenClaw 문서: https://docs.openclaw.ai
- PWA 테스트: Chrome DevTools → Application → Service Workers

---

**최종 업데이트**: 2026-04-01 16:10 KST
**버전**: v4 (commit 4f32250)
