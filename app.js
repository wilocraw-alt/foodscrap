// 국회도서관 식단표 v2 — 순수 JS (GitHub Pages)
// data/menu.json에서 로드, localStorage 캐싱

let menuData = null;
let currentDayIndex = -1;

const CACHE_KEY = 'foodscrap_menu';
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000; // 6시간

// ─── 요일 파싱 ──────────────────────────────
function getTodayDayName() {
  const d = new Date().getDay();
  return d === 0 ? '일' : ['월','화','수','목','금','토','일'][d];
}

function parseDayChar(dayLabel) {
  const m = dayLabel.match(/\((.)\)/);
  return m ? m[1] : dayLabel;
}

// ─── 캐시 관리 ──────────────────────────────
function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_MAX_AGE) return null;
    return cache.data;
  } catch { return null; }
}

function setCached(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  } catch { /* quota exceeded, ignore */ }
}

function clearCached() {
  localStorage.removeItem(CACHE_KEY);
}

// ─── API 호출 ──────────────────────────────
async function fetchMenu(bypassCache = false) {
  // 캐시 확인
  if (!bypassCache) {
    const cached = getCached();
    if (cached) return { ...cached, _cached: true };
  }

  // GitHub Pages에서 menu.json 로드
  const cacheBuster = bypassCache ? `?t=${Date.now()}` : '';
  const resp = await fetch(`data/menu.json${cacheBuster}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  setCached(data);
  return data;
}

// ─── 초기 로드 ──────────────────────────────
async function init() {
  const area = document.getElementById('menuArea');
  area.innerHTML = '<div class="loading">불러오는 중...</div>';

  try {
    menuData = await fetchMenu();
    if (menuData.error) {
      area.innerHTML = `<div class="error">❌ ${menuData.error}</div>`;
      return;
    }
    render(menuData._cached || false);
  } catch (e) {
    area.innerHTML = `<div class="error">❌ 데이터 로드 실패<br>${e.message}</div>`;
  }
}

// ─── 렌더링 ────────────────────────────────
function render(isCached = false) {
  // 제목
  let subtitle = menuData.date_range || '';
  if (isCached) subtitle += ' <span class="cache-badge">캐시</span>';
  document.getElementById('dateRange').innerHTML = subtitle;

  // 탭 생성
  const tabsEl = document.getElementById('dayTabs');
  tabsEl.innerHTML = '';
  const todayName = getTodayDayName();

  menuData.days.forEach((day, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    const dayChar = parseDayChar(day.day);
    btn.textContent = dayChar;

    if (dayChar === todayName) {
      btn.classList.add('today');
      if (currentDayIndex === -1) currentDayIndex = i;
    }

    btn.addEventListener('click', () => selectDay(i));
    tabsEl.appendChild(btn);
  });

  if (currentDayIndex === -1) currentDayIndex = 0;
  selectDay(currentDayIndex);

  // 업데이트 시간
  const fetchedAt = menuData.fetched_at
    ? new Date(menuData.fetched_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    : '알 수 없음';
  document.getElementById('updateInfo').textContent = `수집: ${fetchedAt}`;
}

// ─── 날짜 선택 ──────────────────────────────
function selectDay(index) {
  currentDayIndex = index;
  const day = menuData.days[index];

  document.querySelectorAll('.tab').forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });

  const area = document.getElementById('menuArea');
  const libs = day['도서관식당'] || [];
  const mus = day['박물관식당'] || [];

  const isClosed = (arr) =>
    arr.some(m => m.includes('영업을하지않습니다') || m.includes('영업을 하지 않습니다'));

  let html = '';
  html += renderCard('도서관식당', '📚', libs, isClosed(libs));
  html += renderCard('박물관식당', '🏛️', mus, isClosed(mus));

  if (!html) html = '<div class="no-menu">메뉴 정보가 없습니다</div>';
  area.innerHTML = html;
}

function renderCard(name, icon, items, closed) {
  if (closed) {
    return `
      <div class="restaurant-card">
        <div class="restaurant-name">
          <span class="restaurant-icon">${icon}</span>${name}
        </div>
        <div class="closed">
          <div class="closed-icon">😴</div>
          영업을 하지 않습니다
        </div>
      </div>`;
  }

  if (!items.length) return '';

  const list = items
    .map(m => `<li class="menu-item"><span class="menu-bullet"></span>${m}</li>`)
    .join('');

  return `
    <div class="restaurant-card">
      <div class="restaurant-name">
        <span class="restaurant-icon">${icon}</span>${name}
      </div>
      <ul class="menu-list">${list}</ul>
    </div>`;
}

// ─── 재수집 (캐시 무시하고 menu.json 재패치) ──
async function refreshMenu() {
  const btn = document.getElementById('btnRefresh');
  btn.classList.add('loading');
  btn.textContent = '⏳ 갱신 중...';

  try {
    clearCached();
    menuData = await fetchMenu(true);
    if (menuData.error) {
      alert('갱신 실패: ' + menuData.error);
    } else {
      currentDayIndex = -1;
      render(false);
    }
  } catch (e) {
    alert('갱신 실패: ' + e.message);
  } finally {
    btn.classList.remove('loading');
    btn.textContent = '🔄 재수집';
  }
}

// ─── 시작 ──────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
