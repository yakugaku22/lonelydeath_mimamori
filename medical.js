// ===========================
//  medical.js - 医療関係者
// ===========================

let selectedPatientId = null;

const statusBgClass = {
  great: 'status-great-bg',
  good:  'status-good-bg',
  bad:   'status-bad-bg',
  sick:  'status-sick-bg',
};

/**
 * 患者一覧を描画する
 * @param {Array} patients - 表示する患者リスト
 */
function renderPatientList(patients) {
  const listEl = document.getElementById('patientList');
  listEl.innerHTML = '';

  patients.forEach(p => {
    const statusData = AppData.healthStatus[p.status];
    const row = document.createElement('div');
    row.className = 'patient-row';
    row.onclick = () => showDetail(p.id);

    row.innerHTML = `
      <span class="patient-row-emoji">${statusData.emoji}</span>
      <div class="patient-row-info">
        <p class="patient-row-name">${p.name}さん</p>
        <p class="patient-row-age">${p.age}才</p>
      </div>
      <span class="patient-row-status ${statusBgClass[p.status]}">${statusData.label}</span>
    `;

    listEl.appendChild(row);
  });
}

/**
 * 患者を名前で絞り込む
 */
function filterPatients() {
  const query = document.getElementById('searchInput').value;
  const filtered = AppData.patients.filter(p =>
    p.name.includes(query)
  );
  renderPatientList(filtered);
}

/**
 * 患者詳細を表示する
 * @param {number} id - 患者ID
 */
function showDetail(id) {
  selectedPatientId = id;
  const p = AppData.patients.find(pt => pt.id === id);
  if (!p) return;

  const statusData = AppData.healthStatus[p.status];

  // 詳細画面のコンテンツをセット
  document.getElementById('detailEmoji').textContent = statusData.emoji;
  document.getElementById('detailName').textContent = p.name + 'さん';

  const badge = document.getElementById('detailStatusBadge');
  badge.textContent = statusData.label;
  badge.className = `detail-status-badge ${statusBgClass[p.status]}`;

  document.getElementById('detailLastVisit1').textContent = p.lastVisit;
  document.getElementById('detailMedicine1').textContent  = p.medicine;

  // 画面切り替え
  document.getElementById('listView').style.display   = 'none';
  document.getElementById('detailView').style.display = 'block';

  // 今日の日付をデフォルトでセット
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('editVisitDate').value = today;
}

/**
 * 来院情報を保存する（仮：アラートで確認）
 */
function saveRecord() {
  const visitDate = document.getElementById('editVisitDate').value;
  const medicine  = document.getElementById('editMedicine').value;
  const message   = document.getElementById('editMessage').value;

  if (!visitDate) {
    alert('来院日を入力してください');
    return;
  }

  // 仮データに保存
  const p = AppData.patients.find(pt => pt.id === selectedPatientId);
  if (p) {
    p.lastVisit = visitDate;
    if (medicine) p.medicine = medicine;
  }

  // 伝達事項がある場合のみ通知
  if (message) {
    alert(`✅ 保存しました！\n伝達事項：「${message}」\n→ 見守る側に通知を送りました`);
  } else {
    alert('✅ 来院情報を保存しました！');
  }

  // フォームリセット
  document.getElementById('editMedicine').value = '';
  document.getElementById('editMessage').value  = '';
}

/**
 * 一覧画面に戻る
 */
function goBackToList() {
  if (document.getElementById('detailView').style.display !== 'none') {
    // 詳細 → 一覧に戻る
    document.getElementById('listView').style.display   = 'block';
    document.getElementById('detailView').style.display = 'none';
    selectedPatientId = null;
  } else {
    // 一覧 → ログインに戻る
    window.location.href = 'index.html';
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  renderPatientList(AppData.patients);
});
