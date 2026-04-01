// 국회도서관 식단표 v3 — 순수 JS (GitHub Pages)

let menuData = null;
let currentDayIndex = -1;

const CACHE_KEY = 'foodscrap_menu';
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;

const DAY_NAMES = ['일','월','화','수','목','금','토'];

function getTodayDayName() {
  return DAY_NAMES[new Date().getDay()];
}

function parseDayChar(dayLabel) {
  const m = dayLabel.match(/\((.)\)/);
  return m ? m[1] : dayLabel;
}

function parseDateNum(dayLabel) {
  const m = dayLabel.match(/\d+\.(\d{1,2})/);
  return m ? m[1] : dayLabel.match(/(\d{1,2})/)?.[0] || '';
}

function parseDayOfWeek(dayLabel) {
  const m = dayLabel.match(/\(([가-힣])\)/);
  return m ? m[1] : '';
}




// ─── 반응 토글 ──────────────────────────────

// ─── GitHub Issues 요청 목록 ───────────────────
async function fetchRecentRequests() {
  const container = document.getElementById('recentRequests');
  if (!container) return;

  try {
    const resp = await fetch('https://api.github.com/repos/wilocraw-alt/foodscrap/issues?labels=menu-request&per_page=5');
    if (!resp.ok) throw new Error('API error');
    const issues = await resp.json();
    renderRequests(issues);
  } catch (e) {
    container.innerHTML = '<div class="error">⚠️ 요청 목록을 불러올 수 없습니다.</div>';
  }
}

function renderRequests(issues) {
  const container = document.getElementById('recentRequests');
  if (issues.length === 0) {
    container.innerHTML = '<div class="empty">아직 요청이 없습니다.</div>';
    return;
  }
  const list = document.createElement('ul');
  list.className = 'request-list';
  issues.forEach(issue => {
    const li = document.createElement('li');
    li.innerHTML = \`
      <a href="\${issue.html_url}" target="_blank" rel="noopener">
        <strong>\${issue.title.replace(/^식단 요청: /, '')}</strong>
        <span class="meta">by \${issue.user.login} (\${timeAgo(issue.created_at)})</span>
      </a>
    \`;
    list.appendChild(li);
  });
  container.innerHTML = '';
  container.appendChild(list);
}

function openRequest() {
  window.open('https://github.com/wilocraw-alt/foodscrap/issues/new?title=식단 요청: &labels=menu-request', '_blank');
}

function timeAgo(dateStr) {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return \`\${Math.floor(diff/60)}분 전\`;
  if (diff < 86400) return \`\${Math.floor(diff/3600)}시간 전\`;
  return \`\${Math.floor(diff/86400)}일 전\`;
}


// ─── 메뉴 이모지 매칭 ──────────────────────
function getMenuEmoji(text) {
  if (/탕수육|스테이크|깐풍|돈까스|불고기|갈비|삼겹|제육|함박|유린기|꼬막/.test(text)) return '🍖';
  if (/국|탕|찌개|스프/.test(text)) return '🍲';
  if (/밥|볶음밥|비빔밥|잡곡밥|현미/.test(text)) return '🍚';
  if (/면|국수|라면|라멘|짬뽕|짜장|우동|쫄면|쌀국수/.test(text)) return '🍜';
  if (/샐러드/.test(text)) return '🥗';
  if (/생선|고등어|가자미|갈치|코다리/.test(text)) return '🐟';
  if (/김치|깍두기|무침|겉절이|열무/.test(text)) return '🥬';
  if (/튀김|까스|강정/.test(text)) return '🍤';
  if (/카레|커리/.test(text)) return '🍛';
  if (/계란|오므라이스/.test(text)) return '🍳';
  if (/스프|죽/.test(text)) return '🥣';
  if (/빵|식빵/.test(text)) return '🍞';
  if (/영업을하지않습니다/.test(text)) return '😴';
  return '🍴';
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
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {}
}

function clearCached() {
  localStorage.removeItem(CACHE_KEY);
}

// ─── API 호출 ──────────────────────────────
async function fetchMenu(bypassCache = false) {
  if (!bypassCache) {
    const cached = getCached();
    if (cached) return { ...cached, _cached: true };
  }
  const cb = bypassCache ? `?t=${Date.now()}` : '';
  const resp = await fetch(`data/menu.json${cb}`);
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
  let subtitle = menuData.date_range || '';
  if (isCached) subtitle += ' <span class="cache-badge">캐시</span>';
  document.getElementById('dateRange').innerHTML = subtitle;

  const tabsEl = document.getElementById('dayTabs');
  tabsEl.innerHTML = '';
  const todayName = getTodayDayName();

  menuData.days.forEach((day, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    const dayChar = parseDayChar(day.day);
    const dateNum = parseDateNum(day.day);
    const dayOfWeek = parseDayOfWeek(day.day);

    // 탭: 날짜 숫자 + 요일
    btn.innerHTML = `<span class="tab-day">${dateNum || dayChar}</span><span class="tab-date">${dayOfWeek}</span>`;

    if (dayChar === todayName) {
      btn.classList.add('today');
      if (currentDayIndex === -1) currentDayIndex = i;
    }

    btn.addEventListener('click', () => selectDay(i));
    tabsEl.appendChild(btn);
  });

  if (currentDayIndex === -1) currentDayIndex = 0;
  selectDay(currentDayIndex);

  const fetchedAt = menuData.fetched_at
    ? new Date(menuData.fetched_at).toLocaleTimeString('ko-KR', {
        timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: true
      })
    : '알 수 없음';
  document.getElementById('updateInfo').textContent = `Last Updated: ${fetchedAt}`;
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

  // 날짜 제목
  html += `<div class="date-title">${day.day}</div>`;

  // 도서관식당 카드 (중식)
  if (libs.length) {
    if (isClosed(libs)) {
      html += renderEmptyCard('📚', '도서관식당', '영업을 하지 않습니다');
    } else {
      html += renderCard('📚', '도서관식당', '11:30 ~ 13:30', libs);
    }
  }

  // 박물관식당 카드 (석식)
  if (mus.length) {
    if (isClosed(mus)) {
      html += renderEmptyCard('🏛️', '박물관식당', '영업을 하지 않습니다');
    } else {
      html += renderCard('🏛️', '박물관식당', '11:30 ~ 13:30', mus);
    }
  }

  if (!html || html === `<div class="date-title">${day.day}</div>`) {
    html += '<div class="empty-card"><div class="empty-icon">📭</div><div class="empty-text">메뉴 정보가 없습니다</div></div>';
  }

  area.innerHTML = html;

  // 식단 요청하기 버튼 & 최근 요청
  if (!document.getElementById('requestSection')) {
    const requestSection = document.createElement('div');
    requestSection.id = 'requestSection';
    requestSection.innerHTML = \`
      <div class="request-section">
        <button class="btn-request" onclick="openRequest()">
          💡 식단 요청하기
        </button>
        <div class="recent-requests" id="recentRequests">
          <div class="loading">최근 요청을 불러오는 중...</div>
        </div>
      </div>
    \`;
    document.getElementById('menuArea').appendChild(requestSection);
  }

  // 최근 요청 로드
  fetchRecentRequests();
}

function renderCard(icon, name, time, items) {
  const menuItems = items.map(item => {
    const emoji = getMenuEmoji(item);
    // 반응 이모지 랜덤 생성 (시드: 메뉴명 해시)
    return `<li class="menu-item">
      <span class="menu-emoji">${emoji}</span>
      <span class="menu-text">${item}</span>
      <span class="menu-reactions">${reactions}</span>
    </li>`;
  }).join('');

  // 카드의 대표 반응 (첫 번째 메뉴 기반)
  const representativeItem = items[0] || '';
  const reactions = [
    {emoji: '👍', count: hashCount(representativeItem, '👍')},
    {emoji: '😋', count: hashCount(representativeItem, '😋')},
    {emoji: '🔥', count: hashCount(representativeItem, '🔥')},
  ];
  const reactionBtns = reactions.map(r =>
    `<span class="reaction-btn" onclick="react(this)" data-emoji="${r.emoji}">${r.emoji} <span class="count">${r.count}</span></span>`
  ).join('');

  return `
    <div class="menu-card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon">${icon}</span>
          <span class="card-name">${name}</span>
        </div>
        <span class="card-badge">${time}</span>
      </div>
      <ul class="menu-list">${menuItems}</ul></div>`;
}

function renderEmptyCard(icon, name, msg) {
  return `
    <div class="menu-card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon">${icon}</span>
          <span class="card-name">${name}</span>
        </div>
      </div>
      <div class="empty-card">
        <div class="empty-icon">😴</div>
        <div class="empty-text">${msg}</div>
      </div>
    </div>`;
}

// ─── 재수집 ──────────────────────────────
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

document.addEventListener('DOMContentLoaded', init);
