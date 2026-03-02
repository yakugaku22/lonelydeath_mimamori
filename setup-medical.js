// ===========================
//  setup-medical.js - 医療関係者の初回設定
// ===========================

let currentStep = 1;
const TOTAL_STEPS = 2;
let addedPatients = []; // ペアリング済み患者リスト

/**
 * 次のステップへ進む
 */
function nextStep(step) {
  if (step === 1) {
    const name = document.getElementById('m-name').value.trim();
    const institution = document.getElementById('m-institution').value.trim();
    if (!name)        { alert('お名前を入力してください'); return; }
    if (!institution) { alert('所属機関を入力してください'); return; }
  }

  document.getElementById(`step-${step}`).classList.add('hidden');
  document.getElementById(`step-${step + 1}`).classList.remove('hidden');
  updateIndicator(step + 1);
  currentStep = step + 1;
  document.querySelector('.setup-card').scrollTop = 0;
}

/**
 * 前のステップに戻る
 */
function prevStep(step) {
  document.getElementById(`step-${step}`).classList.add('hidden');
  document.getElementById(`step-${step - 1}`).classList.remove('hidden');
  updateIndicator(step - 1);
  currentStep = step - 1;
  document.querySelector('.setup-card').scrollTop = 0;
}

/**
 * ステップインジケーターを更新する
 */
function updateIndicator(activeStep) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < activeStep)   dot.classList.add('done');
    if (i === activeStep) dot.classList.add('active');
  }
  const lines = document.querySelectorAll('.step-line');
  lines.forEach((line, idx) => {
    line.classList.toggle('done', idx < activeStep - 1);
  });
}

/**
 * ペアリングコードを確認して患者を追加する
 */
function checkPairCode() {
  const code = document.getElementById('m-pair-code').value.trim();
  const resultEl = document.getElementById('pairResult');
  const iconEl   = document.getElementById('pairIcon');
  const textEl   = document.getElementById('pairResultText');

  if (!code) { alert('コードを入力してください'); return; }

  // 既に追加済みかチェック
  if (addedPatients.find(p => p.pairCode === code)) {
    iconEl.textContent = '⚠️';
    textEl.textContent = 'このコードはすでに追加済みです';
    resultEl.classList.remove('hidden');
    resultEl.style.background = '#FFF9C4';
    resultEl.style.color = '#E65100';
    return;
  }

  // localStorageから当事者データを照合
  const patientSetupRaw = localStorage.getItem('patientSetup');

  if (patientSetupRaw) {
    const patientSetup = JSON.parse(patientSetupRaw);
    if (patientSetup.pairCode === code) {
      // マッチ！
      addedPatients.push({ name: patientSetup.name, pairCode: code });
      iconEl.textContent = '✅';
      textEl.textContent = `${patientSetup.name}さんとペアリングできました！`;
      resultEl.classList.remove('hidden');
      resultEl.style.background = '#E8F5E9';
      resultEl.style.color = '#2E7D32';
      renderAddedPatients();
      document.getElementById('m-pair-code').value = '';
      return;
    }
  }

  // デモ用：コードが一致しなくてもデモ患者として追加できるようにする
  iconEl.textContent = '⚠️';
  textEl.textContent = 'コードが一致する患者が見つかりませんでした（デモ：当事者側の設定が必要です）';
  resultEl.classList.remove('hidden');
  resultEl.style.background = '#FFF3E0';
  resultEl.style.color = '#E65100';
}

/**
 * 追加済み患者リストを描画する
 */
function renderAddedPatients() {
  if (addedPatients.length === 0) return;

  const container = document.getElementById('addedPatients');
  const listEl    = document.getElementById('addedPatientsList');
  container.style.display = 'block';
  listEl.innerHTML = '';

  addedPatients.forEach(p => {
    const el = document.createElement('div');
    el.className = 'added-patient-row';
    el.innerHTML = `
      <span>👤 ${p.name}さん</span>
      <span class="added-patient-code">${p.pairCode}</span>
    `;
    listEl.appendChild(el);
  });
}

/**
 * 設定を完了してlocalStorageに保存する
 */
function completeSetup() {
  const medicalData = {
    name:        document.getElementById('m-name').value.trim(),
    institution: document.getElementById('m-institution').value.trim(),
    role:        document.getElementById('m-role').value.trim(),
    tel:         document.getElementById('m-tel').value.trim(),
    patients:    addedPatients,
    setupDone:   true,
  };

  localStorage.setItem('medicalSetup', JSON.stringify(medicalData));

  alert(`✅ 設定が完了しました！\nようこそ、${medicalData.name}先生！`);
  window.location.href = 'medical.html';
}
