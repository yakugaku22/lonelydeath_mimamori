// ===========================
//  patient.js - 見守られる側
// ===========================

const healthMessages = {
  great: {
    message: '元気！',
    sub:     '今日も笑顔で過ごしてくださいね！😊',
    bg:      'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
  },
  good: {
    message: 'そこそこ元気！',
    sub:     '今日もぼちぼち、頑張りすぎず 🙂',
    bg:      'linear-gradient(135deg, #E8F5E9, #E0F7FA)',
  },
  bad: {
    message: '少し体調悪い…',
    sub:     '無理しない生活を！！\n薬や睡眠、しっかりと 😌',
    bg:      'linear-gradient(135deg, #FFFDE7, #FFF9C4)',
  },
  sick: {
    message: '体調が悪い…',
    sub:     '必要に応じて受診しましょう！\nどうか無理しないでください 💜',
    bg:      'linear-gradient(135deg, #F3E5F5, #E3F2FD)',
  },
};

/**
 * 体調ボタンを選択したときの処理
 */
function selectHealth(btn) {
  const status = btn.dataset.status;
  document.querySelectorAll('.health-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  setTimeout(() => showResult(status), 400);
}

/**
 * 結果メッセージを表示
 * @param {string}  status - 体調ステータスキー
 * @param {boolean} save   - trueなら保存する（デフォルトtrue）
 */
function showResult(status, save = true) {
  const data = AppData.healthStatus[status];
  const msg  = healthMessages[status];

  // 保存フラグがtrueのときだけlocalStorageに記録
  if (save) Store.recordHealth(status);

  document.getElementById('healthButtons').closest('.health-section').style.display = 'none';
  const resultSection = document.getElementById('resultSection');
  resultSection.style.display = 'block';

  document.getElementById('resultEmoji').textContent    = data.emoji;
  document.getElementById('resultMessage').textContent  = msg.message;
  document.getElementById('resultSub').textContent      = msg.sub;
  document.getElementById('resultCard').style.background = msg.bg;

  // 今日すでに入力済みの場合はボタンを「変更する」に変える
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.textContent = save ? 'もう一度答える' : '✏️ 変更する';
  }
}

/**
 * 選択画面に戻る（変更モード）
 */
function resetSelection() {
  document.querySelectorAll('.health-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector('.health-section').style.display = 'block';
  document.getElementById('resultSection').style.display  = 'none';
}

/**
 * ペアリングコードパネルをトグル表示する
 */
function togglePairCode() {
  const panel = document.getElementById('pairCodePanel');
  const btn   = document.getElementById('pairCodeToggleBtn');
  if (!panel) return;
  panel.classList.toggle('hidden');
  btn.textContent = panel.classList.contains('hidden') ? '🔗 コード確認' : '✕ 閉じる';
}

/**
 * 医師からの通知を見守られる側にも表示する
 */
function renderPatientNotification() {
  const notifications = Store.getNotifications().filter(n => !n.read);
  if (notifications.length === 0) return;

  const latest  = notifications[notifications.length - 1];
  const banner  = document.getElementById('patientMedicalBanner');
  const sender  = document.getElementById('patientMedicalSender');
  const textEl  = document.getElementById('patientMedicalText');
  if (!banner) return;

  banner.style.display = 'flex';

  const doctor = (latest.doctorName && latest.doctorName !== 'undefined') ? latest.doctorName : '担当医';
  const org    = (latest.institution && latest.institution !== 'undefined') ? latest.institution : '';
  const senderName = org
    ? `${org} ${doctor}先生からのお知らせ`
    : `${doctor}先生からのお知らせ`;

  if (sender) sender.textContent = senderName;
  if (textEl) textEl.textContent = `「${latest.message}」（${latest.date}）`;
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    const patient = Store.getPatient();
    const name = (patient && patient.name) ? patient.name : '';
    const el = document.getElementById('patientName');
    if (el) el.textContent = name ? name + 'さん' : '';

    // ペアリングコードを表示
    const codeEl = document.getElementById('pairCodeDisplay');
    if (codeEl && patient && patient.pairCode) {
      codeEl.textContent = patient.pairCode;
    }

    // 今日すでに入力済みなら結果画面を最初から表示する
    const todayStatus = Store.getHealthHistory()[Store.getTodayStr()];
    if (todayStatus) {
      showResult(todayStatus, false); // false = 保存しない（表示だけ）
    }

    // 医師からの通知を表示
    renderPatientNotification();
  } catch(e) {
    console.warn('患者名の読み込みに失敗しました', e);
  }
});
