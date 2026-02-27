// ===========================
//  watcher.js - 見守る側
// ===========================

const statusColors = {
  great: '#FF6B35',
  good:  '#6BCB77',
  bad:   '#FFD93D',
  sick:  '#C77DFF',
};

let currentYear, currentMonth;

/**
 * 今日の体調を表示する
 */
function renderTodayStatus() {
  const today = getTodayStr();
  const status = AppData.healthHistory[today];

  if (status) {
    const data = AppData.healthStatus[status];
    document.getElementById('todayEmoji').textContent = data.emoji;
    document.getElementById('todayLabel').textContent = data.label;
    document.getElementById('todayStatus').style.background =
      status === 'great' ? '#FFF3E0' :
      status === 'good'  ? '#E8F5E9' :
      status === 'bad'   ? '#FFFDE7' : '#F3E5F5';

    // 体調が悪い場合はアラートバナーを表示
    if (status === 'sick') {
      document.getElementById('alertBanner').style.display = 'flex';
    }
  }
}

/**
 * カレンダーを描画する
 */
function renderCalendar() {
  const titleEl = document.getElementById('calTitle');
  const gridEl  = document.getElementById('calendarGrid');

  titleEl.textContent = `${currentYear}年${currentMonth + 1}月`;

  // グリッドをリセット
  gridEl.innerHTML = '';

  // 曜日ラベル
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
  dayLabels.forEach(label => {
    const el = document.createElement('div');
    el.className = 'cal-day-label';
    el.textContent = label;
    gridEl.appendChild(el);
  });

  // 月の1日と末日
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = getTodayStr();

  // 空白マス
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    gridEl.appendChild(el);
  }

  // 日付マス
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const status = AppData.healthHistory[dateStr];

    const el = document.createElement('div');
    el.className = 'cal-day';
    if (status) el.classList.add(`status-${status}`);
    if (dateStr === todayStr) el.classList.add('today');

    el.innerHTML = `<span>${d}</span>`;

    // 体調ドット
    if (status) {
      const dot = document.createElement('div');
      dot.className = 'cal-dot';
      dot.style.background = statusColors[status];
      el.appendChild(dot);
    }

    gridEl.appendChild(el);
  }
}

/**
 * 月を変更する
 * @param {number} delta - +1 or -1
 */
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0;  currentYear++; }
  if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
  renderCalendar();
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す
 */
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();

  document.getElementById('watcherTitle').textContent =
    AppData.patient.name + 'さんのデータ';

  renderTodayStatus();
  renderCalendar();
});
