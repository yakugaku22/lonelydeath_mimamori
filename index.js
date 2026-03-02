// ===========================
//  index.js - トップページ
// ===========================

const SETUP_KEYS = ['patientSetup', 'watcherSetup', 'medicalSetup'];

const ROLE_INFO = {
  patientSetup: { icon: '😊', label: '見守られる側', color: '#FF6B35' },
  watcherSetup: { icon: '👨‍👩‍👧', label: '見守る側',    color: '#6BCB77' },
  medicalSetup: { icon: '🏥', label: '医療関係者',  color: '#45B7D1' },
};

// 個別リセット対象を一時保存
let pendingResetKey = null;

/**
 * 設定状況バッジと個別リセットボタンを描画する
 */
function renderSetupStatus() {
  const statusEl  = document.getElementById('setupStatus');
  const resetArea = document.getElementById('resetArea');

  const savedKeys = SETUP_KEYS.filter(k => localStorage.getItem(k));

  if (savedKeys.length === 0) {
    statusEl.innerHTML = '';
    resetArea.style.display = 'none';
    return;
  }

  const badges = savedKeys.map(k => {
    const data = JSON.parse(localStorage.getItem(k));
    const name = data.name || '';
    const { icon, label, color } = ROLE_INFO[k];
    return `
      <div class="status-badge">
        <span>${icon}</span>
        <span class="status-badge-name">${label}：${name}</span>
        <span class="status-done">設定済み ✓</span>
        <button class="individual-reset-btn" onclick="confirmIndividualReset('${k}')"
                style="--btn-color:${color}">
          リセット
        </button>
      </div>`;
  }).join('');

  statusEl.innerHTML = `<p class="status-title">保存済みの設定</p>${badges}`;
  resetArea.style.display = 'block';
}

/**
 * 個別リセットの確認モーダルを開く
 * @param {string} key - リセット対象のlocalStorageキー
 */
function confirmIndividualReset(key) {
  pendingResetKey = key;
  const { icon, label } = ROLE_INFO[key];
  document.getElementById('resetModalIcon').textContent  = icon;
  document.getElementById('resetModalTitle').textContent = `${label}の設定をリセットしますか？`;
  document.getElementById('resetModalDesc').textContent  =
    `「${label}」の登録情報が削除されます。次回ログイン時に再設定が必要になります。`;
  document.getElementById('resetModal').style.display = 'flex';
}

/**
 * 全リセットの確認モーダルを開く
 */
function confirmReset() {
  pendingResetKey = 'ALL';
  document.getElementById('resetModalIcon').textContent  = '⚠️';
  document.getElementById('resetModalTitle').textContent = '全ての設定をリセットしますか？';
  document.getElementById('resetModalDesc').textContent  =
    '保存されている全ての設定情報が削除されます。この操作は取り消せません。';
  document.getElementById('resetModal').style.display = 'flex';
}

/**
 * モーダルを閉じる
 */
function closeModal() {
  document.getElementById('resetModal').style.display = 'none';
  pendingResetKey = null;
}

/**
 * リセットを実行する（個別 or 全件）
 */
function executeReset() {
  if (pendingResetKey === 'ALL') {
    SETUP_KEYS.forEach(k => localStorage.removeItem(k));
  } else if (pendingResetKey) {
    localStorage.removeItem(pendingResetKey);
  }

  closeModal();
  const card = document.querySelector('.login-card');
  card.style.transition = 'opacity 0.3s ease';
  card.style.opacity = '0.5';
  setTimeout(() => location.reload(), 400);
}

// モーダル外クリックで閉じる
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('resetModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('resetModal')) closeModal();
  });
  renderSetupStatus();
});
