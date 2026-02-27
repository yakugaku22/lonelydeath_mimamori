// ===========================
//  patient.js - 見守られる側
// ===========================

// 体調選択後のメッセージ定義
const healthMessages = {
  great: {
    message: '元気！→ 素敵な1日になりますように 😊',
    sub: '今日も笑顔で過ごしてくださいね！',
    bg: 'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
  },
  good: {
    message: 'そこそこ元気！',
    sub: '今日もぼちぼち、頑張りすぎず 🙂',
    bg: 'linear-gradient(135deg, #E8F5E9, #E0F7FA)',
  },
  bad: {
    message: '少し体調悪い…',
    sub: '無理しない生活を！！\n薬や睡眠、しっかりと 😌',
    bg: 'linear-gradient(135deg, #FFFDE7, #FFF9C4)',
  },
  sick: {
    message: '体調が悪い…',
    sub: '必要に応じて受診しましょう！\nどうか無理しないでください 💜',
    bg: 'linear-gradient(135deg, #F3E5F5, #E3F2FD)',
  },
};

/**
 * 体調ボタンを選択したときの処理
 * @param {HTMLElement} btn - クリックされたボタン
 */
function selectHealth(btn) {
  const status = btn.dataset.status;

  // 全ボタンのselectedクラスをリセット
  document.querySelectorAll('.health-btn').forEach(b => b.classList.remove('selected'));

  // 選択したボタンにselectedクラスを付与
  btn.classList.add('selected');

  // 少し待ってから結果を表示（選択アニメーションを見せるため）
  setTimeout(() => showResult(status), 400);
}

/**
 * 結果メッセージを表示する
 * @param {string} status - 体調ステータスキー
 */
function showResult(status) {
  const data = AppData.healthStatus[status];
  const msg = healthMessages[status];

  // 体調履歴に今日の分を保存（仮：変数に格納）
  const today = getTodayStr();
  AppData.healthHistory[today] = status;

  // 結果セクションを表示
  document.getElementById('healthButtons').closest('.health-section').style.display = 'none';
  const resultSection = document.getElementById('resultSection');
  resultSection.style.display = 'block';

  // 内容をセット
  document.getElementById('resultEmoji').textContent = data.emoji;
  document.getElementById('resultMessage').textContent = msg.message;
  document.getElementById('resultSub').textContent = msg.sub;
  document.getElementById('resultCard').style.background = msg.bg;
}

/**
 * 選択をリセットして最初の状態に戻す
 */
function resetSelection() {
  document.querySelectorAll('.health-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector('.health-section').style.display = 'block';
  document.getElementById('resultSection').style.display = 'none';
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す
 * @returns {string}
 */
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
  // 名前を表示
  document.getElementById('patientName').textContent =
    AppData.patient.name + 'さん';
});
