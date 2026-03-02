// ===========================
//  medical.js - 医療関係者
// ===========================

let selectedPatientId = null;
let currentPatients   = [];

const statusBgClass = {
  great: 'status-great-bg',
  good:  'status-good-bg',
  bad:   'status-bad-bg',
  sick:  'status-sick-bg',
};

/**
 * 患者一覧を描画する
 * localStorageのpatientSetupをベースに動的生成
 */
function renderPatientList(patients) {
  const listEl = document.getElementById('patientList');
  listEl.innerHTML = '';

  if (patients.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👤</div>
        <p class="empty-title">まだ登録された患者がいません</p>
        <p class="empty-desc">患者の方が初回設定を完了し、ペアリングコードで紐付けると<br />こちらに表示されます</p>
      </div>`;
    return;
  }

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
  const query    = document.getElementById('searchInput').value;
  const filtered = currentPatients.filter(p => p.name.includes(query));
  renderPatientList(filtered);
}

/**
 * 患者詳細を表示する
 */
function showDetail(id) {
  selectedPatientId = id;
  const p = currentPatients.find(pt => pt.id === id);
  if (!p) return;

  const statusData = AppData.healthStatus[p.status];

  document.getElementById('detailEmoji').textContent = statusData.emoji;
  document.getElementById('detailName').textContent  = p.name + 'さん';

  const badge = document.getElementById('detailStatusBadge');
  badge.textContent = statusData.label;
  badge.className   = `detail-status-badge ${statusBgClass[p.status]}`;

  // 詳細のステータスバナー更新
  const detailBanner  = document.getElementById('detailStatusBanner');
  const detailEmojiEl = document.getElementById('detailTsbEmoji');
  const detailTextEl  = document.getElementById('detailTsbText');
  if (detailBanner) {
    const data = AppData.healthStatus[p.status];
    if (detailEmojiEl) detailEmojiEl.textContent = data.emoji;
    if (detailTextEl)  detailTextEl.textContent  = data.label;
    detailBanner.className = `today-status-banner tsb-${p.status}`;
  }

  // 来院・処方履歴を描画
  renderHospitalCards(p);

  // 画面切り替え
  document.getElementById('listView').style.display   = 'none';
  document.getElementById('detailView').style.display = 'block';

  // 今日の日付をデフォルトでセット
  document.getElementById('editVisitDate').value = Store.getTodayStr();

  // 医療機関名を自動入力
  const medicalSetupForForm = Store.getMedical();
  const hospitalInput = document.getElementById('editHospital');
  if (hospitalInput && medicalSetupForForm && medicalSetupForForm.institution) {
    hospitalInput.value = medicalSetupForForm.institution;
  }
}

/**
 * 来院・処方カードを動的に描画する
 */
function renderHospitalCards(p) {
  const container = document.getElementById('hospitalCards');
  container.innerHTML = '';

  if (!p.hospitals || p.hospitals.length === 0) {
    container.innerHTML = `<p class="no-hospital-msg">来院記録はまだありません。下のフォームから追加できます。</p>`;
    return;
  }

  p.hospitals.forEach((h, idx) => {
    const card = document.createElement('div');
    card.className = 'detail-card';
    card.innerHTML = `
      <p class="detail-card-title">🏥 ${h.name || '医療機関' + (idx + 1)}</p>
      <div class="detail-row">
        <span class="detail-key">最終来院日</span>
        <span class="detail-val">${h.lastVisit || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-key">処方薬</span>
        <span class="detail-val">${h.medicine || '-'}</span>
      </div>`;
    container.appendChild(card);
  });
}

/**
 * 来院・処方情報を保存する
 */
function saveRecord() {
  const visitDate  = document.getElementById('editVisitDate').value;
  const hospital   = document.getElementById('editHospital').value.trim();
  const medicine   = document.getElementById('editMedicine').value.trim();
  const message    = document.getElementById('editMessage').value.trim();

  if (!visitDate) { alert('来院日を入力してください'); return; }

  // 現在の患者データを取得
  const p = currentPatients.find(pt => pt.id === selectedPatientId);
  if (!p) return;

  // 同じ医療機関があれば更新、なければ追加
  const hospitals = p.hospitals || [];
  const existing  = hospitals.find(h => h.name === hospital);
  if (existing) {
    existing.lastVisit = visitDate;
    if (medicine) existing.medicine = medicine;
  } else {
    hospitals.push({
      name:      hospital || '医療機関',
      lastVisit: visitDate,
      medicine:  medicine || '',
    });
  }
  p.hospitals = hospitals;

  // 医師情報を取得して一緒に保存
  const medicalInfo = Store.getMedical();
  const doctorName  = (medicalInfo && medicalInfo.name)        ? medicalInfo.name        : '';
  const institution = (medicalInfo && medicalInfo.institution) ? medicalInfo.institution : '';

  // localStorageに保存（三角関係のデータ共有）
  Store.saveMedicalRecord(selectedPatientId, {
    hospitals,
    message,
    doctorName,
    institution,
  });

  // UIを更新
  renderHospitalCards(p);

  if (message) {
    alert(`✅ 保存しました！\n伝達事項：「${message}」\n→ 見守る側への通知フラグを立てました`);
  } else {
    alert('✅ 来院情報を保存しました！');
  }

  // フォームリセット（医療機関名は残す）
  document.getElementById('editHospital').value = (medicalInfo && medicalInfo.institution) ? medicalInfo.institution : '';
  document.getElementById('editMedicine').value = '';
  document.getElementById('editMessage').value  = '';
}

/**
 * 一覧画面に戻る
 */
function goBackToList() {
  if (document.getElementById('detailView').style.display !== 'none') {
    document.getElementById('listView').style.display   = 'block';
    document.getElementById('detailView').style.display = 'none';
    selectedPatientId = null;
  } else {
    window.location.href = 'index.html';
  }
}

/**
 * 患者追加モーダルを開く
 */
function openAddModal() {
  document.getElementById('addPairCode').value = '';
  document.getElementById('addPatientResult').className = 'add-patient-result hidden';
  document.getElementById('addPatientResult').textContent = '';
  document.getElementById('addPatientModal').style.display = 'flex';
}

/**
 * 患者追加モーダルを閉じる
 */
function closeAddModal() {
  document.getElementById('addPatientModal').style.display = 'none';
}

/**
 * ペアコードを照合して患者を追加する
 */
function executeAddPatient() {
  const code      = document.getElementById('addPairCode').value.trim();
  const resultEl  = document.getElementById('addPatientResult');

  if (!code) { alert('コードを入力してください'); return; }

  // localPatientと照合（デモ：1件のみ。本番はAPIで全ユーザー検索）
  const localPatient = Store.getPatient();
  let patientName = '';

  if (localPatient && localPatient.pairCode === code) {
    patientName = localPatient.name;
  }

  // Store経由で追加（重複チェックあり）
  const added = Store.addMedicalPatient(code, patientName);

  if (!added) {
    resultEl.className = 'add-patient-result error';
    resultEl.textContent = '⚠️ このコードはすでに登録済みです';
    return;
  }

  resultEl.className = 'add-patient-result success';
  resultEl.textContent = patientName
    ? `✅ ${patientName}さんを追加しました！`
    : `✅ コード「${code}」を追加しました（患者が設定を完了すると情報が表示されます）`;

  // 一覧を更新
  setTimeout(() => {
    closeAddModal();
    currentPatients = Store.getMedicalPatients();
    renderPatientList(currentPatients);
  }, 1200);
}

// モーダル外クリックで閉じる
document.addEventListener('click', (e) => {
  const modal = document.getElementById('addPatientModal');
  if (modal && e.target === modal) closeAddModal();
});

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  // 医療者設定から名前を表示
  const medicalUser = Store.getMedical();
  if (medicalUser && medicalUser.name) {
    const el = document.getElementById('medicalName');
    if (el) el.textContent = `${medicalUser.name} 先生`;
  }

  // 当事者のlocalStorageから患者リストを動的生成
  currentPatients = Store.getMedicalPatients();
  renderPatientList(currentPatients);

  // 一覧画面：最新患者の今日のステータスをバナーに表示
  if (currentPatients.length > 0) {
    const first   = currentPatients[0];
    const banner  = document.getElementById('todayStatusBanner');
    const emojiEl = document.getElementById('tsbEmoji');
    const textEl  = document.getElementById('tsbText');
    if (banner && first.status) {
      const data = AppData.healthStatus[first.status];
      if (emojiEl) emojiEl.textContent = data.emoji;
      if (textEl)  textEl.textContent  = data.label;
      banner.className = `today-status-banner tsb-${first.status}`;
    }
  }
});
