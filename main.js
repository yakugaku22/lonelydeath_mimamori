// ===========================
//  main.js - ログイン画面
// ===========================

/**
 * ロール選択 → 各画面へ遷移
 * @param {string} page - 遷移先のHTMLファイル名
 */
function goTo(page) {
  // ボタンにクリックアニメーションをつけてから遷移
  const card = document.querySelector('.login-card');
  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  card.style.transform = 'scale(0.95)';
  card.style.opacity = '0';

  setTimeout(() => {
    window.location.href = page;
  }, 300);
}

// ===========================
//  仮データ（全画面で共有）
// ===========================

/**
 * アプリ全体で使う仮データ
 * 将来Flaskに移行するときは、このデータをAPIレスポンスに置き換えるだけでOK
 */
const AppData = {
  // 当事者プロフィール
  patient: {
    name: '山田太郎',
    age: 75,
  },

  // 体調履歴 (YYYY-MM-DD: ステータスキー)
  healthHistory: {
    '2026-02-20': 'great',
    '2026-02-21': 'good',
    '2026-02-22': 'great',
    '2026-02-23': 'bad',
    '2026-02-24': 'great',
    '2026-02-25': 'good',
    '2026-02-26': 'sick',
  },

  // 体調ステータス定義
  healthStatus: {
    great: { label: '元気 😊',        color: '#FF6B35', emoji: '😊' },
    good:  { label: 'そこそこ元気 🙂', color: '#6BCB77', emoji: '🙂' },
    bad:   { label: '少し体調悪い 😟', color: '#FFD93D', emoji: '😟' },
    sick:  { label: '体調が悪い 😢',   color: '#C77DFF', emoji: '😢' },
  },

  // 医療情報（医療者画面用）
  patients: [
    {
      id: 1,
      name: '山田太郎',
      age: 51,
      status: 'great',
      hospital: '〇〇病院',
      lastVisit: '20XX年0月0日',
      medicine: '〜、〜、〜',
    },
    {
      id: 2,
      name: '鈴木一郎',
      age: 62,
      status: 'sick',
      hospital: '××クリニック',
      lastVisit: '20XX年0月X日',
      medicine: '〜、〜',
    },
    {
      id: 3,
      name: '田中花子',
      age: 80,
      status: 'good',
      hospital: '〇〇病院',
      lastVisit: '20XX年0月0日',
      medicine: '〜、〜、〜、〜',
    },
  ],
};

// グローバルに公開（各ページのJSから参照できるように）
window.AppData = AppData;
