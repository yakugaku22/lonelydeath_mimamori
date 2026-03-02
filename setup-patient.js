// ===========================
//  setup-patient.js - 当事者の初回設定
// ===========================

let currentStep = 1;
const TOTAL_STEPS = 4;

/**
 * 次のステップへ進む
 * @param {number} step - 現在のステップ番号
 */
function nextStep(step) {
  // バリデーション
  if (step === 1) {
    const name = document.getElementById('p-name').value.trim();
    const birthday = document.getElementById('p-birthday').value;
    if (!name) { alert('お名前を入力してください'); return; }
    if (!birthday) { alert('生年月日を入力してください'); return; }
  }

  // 現在のステップを非表示にして次を表示
  document.getElementById(`step-${step}`).classList.add('hidden');
  document.getElementById(`step-${step + 1}`).classList.remove('hidden');

  // インジケーター更新
  updateIndicator(step + 1);
  currentStep = step + 1;

  // カードをトップにスクロール
  document.querySelector('.setup-card').scrollTop = 0;
}

/**
 * 前のステップに戻る
 * @param {number} step - 現在のステップ番号
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
 * @param {number} activeStep - アクティブなステップ番号
 */
function updateIndicator(activeStep) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < activeStep)  dot.classList.add('done');
    if (i === activeStep) dot.classList.add('active');
  }

  // ステップラインの更新
  const lines = document.querySelectorAll('.step-line');
  lines.forEach((line, idx) => {
    line.classList.toggle('done', idx < activeStep - 1);
  });
}

/**
 * コードを自動生成する
 */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById('p-pair-code').value = code;
  document.getElementById('generatedCode').textContent = code;
}

/**
 * 設定を完了してlocalStorageに保存する
 */
function completeSetup() {
  const pairCode = document.getElementById('p-pair-code').value.trim();
  if (!pairCode) { alert('ペアリングコードを入力または生成してください'); return; }

  // 性別取得
  const genderEl = document.querySelector('input[name="p-gender"]:checked');
  const gender = genderEl ? genderEl.value : '';

  // 生年月日から年齢計算
  const birthday = document.getElementById('p-birthday').value;
  const age = birthday ? calcAge(birthday) : null;

  // データをまとめる
  const patientData = {
    name:             document.getElementById('p-name').value.trim(),
    birthday,
    age,
    gender,
    emergencyName:    document.getElementById('p-emergency-name').value.trim(),
    emergencyRelation:document.getElementById('p-emergency-relation').value.trim(),
    emergencyTel:     document.getElementById('p-emergency-tel').value.trim(),
    hospital:         document.getElementById('p-hospital').value.trim(),
    doctor:           document.getElementById('p-doctor').value.trim(),
    hospitalTel:      document.getElementById('p-hospital-tel').value.trim(),
    pairCode,
    setupDone: true,
  };

  // localStorageに保存
  localStorage.setItem('patientSetup', JSON.stringify(patientData));

  // 完了メッセージを出してメイン画面へ
  alert(`✅ 設定が完了しました！\nようこそ、${patientData.name}さん！`);
  window.location.href = 'patient.html';
}

/**
 * 生年月日から年齢を計算する
 * @param {string} birthdayStr - YYYY-MM-DD形式
 * @returns {number}
 */
function calcAge(birthdayStr) {
  const today = new Date();
  const birth = new Date(birthdayStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  // コードを自動生成して表示
  generateCode();

  // p-pair-codeが入力されたらdisplayにも反映
  document.getElementById('p-pair-code').addEventListener('input', (e) => {
    document.getElementById('generatedCode').textContent = e.target.value || '';
  });
});
