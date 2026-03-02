// ===========================
//  setup-watcher.js - 見守る側の初回設定
// ===========================

let currentStep = 1;
const TOTAL_STEPS = 3;
let selectedRelation = '';
let selectedNoReport = 1;

/**
 * 次のステップへ進む
 * @param {number} step - 現在のステップ番号
 */
function nextStep(step) {
  // バリデーション
  if (step === 1) {
    const name = document.getElementById('w-name').value.trim();
    if (!name) { alert('お名前を入力してください'); return; }
    const relation = selectedRelation || document.getElementById('w-relation').value.trim();
    if (!relation) { alert('続柄を選択または入力してください'); return; }
  }

  document.getElementById(`step-${step}`).classList.add('hidden');
  document.getElementById(`step-${step + 1}`).classList.remove('hidden');
  updateIndicator(step + 1);
  currentStep = step + 1;
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
  const lines = document.querySelectorAll('.step-line');
  lines.forEach((line, idx) => {
    line.classList.toggle('done', idx < activeStep - 1);
  });
}

/**
 * チップ（タグボタン）を選択する
 * @param {HTMLElement} el - クリックされたchip要素
 * @param {string} group - チップのグループ名
 */
function selectChip(el, group) {
  if (group === 'relation') {
    document.querySelectorAll('#relation-chips .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedRelation = el.textContent;
    document.getElementById('w-relation').value = '';
  } else if (group === 'no-report') {
    document.querySelectorAll('.no-report-setting .chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedNoReport = parseInt(el.dataset.val);
  }
}

/**
 * 設定を完了してlocalStorageに保存する
 */
function completeSetup() {
  const pairCode = document.getElementById('w-pair-code').value.trim();
  if (!pairCode) { alert('ペアリングコードを入力してください'); return; }

  // 当事者側のコードと照合（デモ：localStorageから取得）
  const patientSetupRaw = localStorage.getItem('patientSetup');
  let pairStatus = 'pending'; // デモでは当事者が未設定でも進めるようにする
  let pairedPatientName = '';

  if (patientSetupRaw) {
    const patientSetup = JSON.parse(patientSetupRaw);
    if (patientSetup.pairCode === pairCode) {
      pairStatus = 'paired';
      pairedPatientName = patientSetup.name;
    } else {
      // コードが違うが、デモなので進めてOKにする
      pairStatus = 'code-mismatch';
    }
  }

  // 通知設定の取得
  const notifySettings = {
    great: document.getElementById('notify-great').checked,
    good:  document.getElementById('notify-good').checked,
    bad:   document.getElementById('notify-bad').checked,
    sick:  document.getElementById('notify-sick').checked,
  };

  const relation = selectedRelation || document.getElementById('w-relation').value.trim();

  const watcherData = {
    name:           document.getElementById('w-name').value.trim(),
    relation,
    tel:            document.getElementById('w-tel').value.trim(),
    notifySettings,
    noReportDays:   selectedNoReport,
    pairCode,
    pairStatus,
    pairedPatientName,
    setupDone: true,
  };

  localStorage.setItem('watcherSetup', JSON.stringify(watcherData));

  // 結果に応じたメッセージ
  if (pairStatus === 'paired') {
    alert(`✅ 設定完了！\n${pairedPatientName}さんとペアリングできました！`);
  } else if (pairStatus === 'code-mismatch') {
    alert(`⚠️ 設定完了！\nコードが当事者側と一致しませんでした。\n当事者の方にコードを確認してください。\n（デモなのでとりあえず進みます）`);
  } else {
    alert(`✅ 設定完了！\n当事者側が設定を完了したら自動でペアリングされます`);
  }

  window.location.href = 'watcher.html';
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  // テキスト入力時はチップの選択を解除
  document.getElementById('w-relation').addEventListener('input', () => {
    document.querySelectorAll('#relation-chips .chip').forEach(c => c.classList.remove('active'));
    selectedRelation = '';
  });
});
