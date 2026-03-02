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

function getEl(id) { return document.getElementById(id); }

/**
 * 今日のステータスバナーを更新する（watcher・medical共通）
 */
function renderTodayStatusBanner(status) {
  const banner  = getEl('todayStatusBanner');
  const emojiEl = getEl('tsbEmoji');
  const textEl  = getEl('tsbText');
  if (!banner) return;

  if (status) {
    const data = AppData.healthStatus[status];
    if (emojiEl) emojiEl.textContent = data.emoji;
    if (textEl)  textEl.textContent  = data.label;
    banner.className = `today-status-banner tsb-${status}`;
  } else {
    if (emojiEl) emojiEl.textContent = '－';
    if (textEl)  textEl.textContent  = '未報告';
    banner.className = 'today-status-banner tsb-none';
  }
}

/**
 * 今日の体調をlocalStorageから取得して表示する
 */
function renderTodayStatus() {
  const today   = Store.getTodayStr();
  const history = Store.getHealthHistory();
  const status  = history[today];

  // ステータスバナー更新
  renderTodayStatusBanner(status || null);

  // 体調が悪い場合はアラートバナー表示
  if (status === 'sick' && getEl('alertBanner')) {
    getEl('alertBanner').style.display = 'flex';
  }
}

/**
 * 医療者からの通知があれば表示する
 */
function renderMedicalNotifications() {
  const notifications = Store.getNotifications().filter(n => !n.read);
  if (notifications.length === 0) return;
  const banner = getEl('medicalNotifyBanner');
  if (!banner) return;
  banner.style.display = 'flex';
  const latest = notifications[notifications.length - 1];
  const textEl = getEl('medicalNotifyText');
  if (textEl) {
    const doctor = (latest.doctorName && latest.doctorName !== 'undefined') ? latest.doctorName : '担当医';
    const org    = (latest.institution && latest.institution !== 'undefined') ? latest.institution : '';
    const sender = org ? `${org} ${doctor}先生` : `${doctor}先生`;
    textEl.textContent = `${sender}より：「${latest.message}」（${latest.date}）`;
  }
}

/**
 * カレンダーを描画する
 */
function renderCalendar() {
  const titleEl = getEl('calTitle');
  const gridEl  = getEl('calendarGrid');
  if (!titleEl || !gridEl) return;

  titleEl.textContent = `${currentYear}年${currentMonth + 1}月`;
  gridEl.innerHTML = '';

  const history   = Store.getHealthHistory();
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
  dayLabels.forEach(label => {
    const el = document.createElement('div');
    el.className = 'cal-day-label';
    el.textContent = label;
    gridEl.appendChild(el);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = Store.getTodayStr();

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    gridEl.appendChild(el);
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const status  = history[dateStr];
    const el = document.createElement('div');
    el.className = 'cal-day';
    if (status) el.classList.add(`status-${status}`);
    if (dateStr === todayStr) el.classList.add('today');
    el.innerHTML = `<span>${d}</span>`;
    if (status) {
      const dot = document.createElement('div');
      dot.className = 'cal-dot';
      dot.style.background = statusColors[status];
      el.appendChild(dot);
    }
    gridEl.appendChild(el);
  }
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0;  currentYear++; }
  if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
  renderCalendar();
}

/**
 * 登録情報パネルをトグル表示する
 */
function toggleProfile() {
  const panel = getEl('profilePanel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  const btn = getEl('profileToggleBtn');
  if (btn) btn.textContent = panel.classList.contains('hidden') ? '👤 登録情報' : '✕ 閉じる';
}

/**
 * 登録情報パネルの中身を描画する
 */
function renderProfilePanel() {
  const watcher = Store.getWatcher();
  const patient = Store.getPatient();
  const rowsEl  = getEl('profileRows');
  if (!rowsEl || !watcher) return;

  const notifyLabels = {
    great: '元気 😊',
    good:  'そこそこ元気 🙂',
    bad:   '少し体調悪い 😟',
    sick:  '体調が悪い 😢',
  };

  const notifyOn = Object.entries(watcher.notifySettings || {})
    .filter(([, v]) => v)
    .map(([k]) => notifyLabels[k])
    .join('、') || '設定なし';

  const noReport = watcher.noReportDays > 0
    ? `${watcher.noReportDays}日間未報告でアラート`
    : '設定なし';

  const pairedName = patient && patient.pairCode === watcher.pairCode
    ? patient.name + 'さん'
    : `コード：${watcher.pairCode}（相手未登録）`;

  const rows = [
    { label: '👤 名前',          value: watcher.name || '未設定' },
    { label: '🤝 続柄',          value: watcher.relation || '未設定' },
    { label: '📞 電話番号',      value: watcher.tel || '未設定' },
    { label: '🔗 ペアリング先',  value: pairedName },
    { label: '🔔 通知設定',      value: notifyOn },
    { label: '⏰ 未報告アラート', value: noReport },
  ];

  rowsEl.innerHTML = rows.map(r => `
    <div class="profile-row">
      <span class="profile-row-label">${r.label}</span>
      <span class="profile-row-value">${r.value}</span>
    </div>`).join('');
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    const now = new Date();
    currentYear  = now.getFullYear();
    currentMonth = now.getMonth();

    const watcherSetup = Store.getWatcher();
    const patient      = Store.getPatient();

    let name = '登録された方';
    if (patient && watcherSetup && patient.pairCode === watcherSetup.pairCode) {
      name = patient.name;
    } else if (patient) {
      name = patient.name;
    }

    const titleEl = getEl('watcherTitle');
    if (titleEl) titleEl.textContent = name + 'さんのデータ';

    renderTodayStatus();
    renderCalendar();
    renderMedicalNotifications();
    renderProfilePanel();

  } catch(e) {
    console.warn('watcher初期化エラー:', e);
  }
});
