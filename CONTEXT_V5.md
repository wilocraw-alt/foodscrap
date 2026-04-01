# Foodscrap v5 - Context

## 목표
1. 불필요한 감정표현(반응) 제거
2. 사용자 식단 요청 게시판 (GitHub Issues 기반) 추가

## 참고
- 현재 구현에 반응(👍😋🔥)이 카드 하단에 표시되고 있음 → 완전 제거
- 게시판은 정적 사이트에서 Issues API로 구현
- API: https://api.github.com/repos/wilocraw-alt/foodscrap/issues?labels=menu-request&per_page=5
