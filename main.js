// ===========================
//  main.js - データ管理の核
// ===========================

/**
 * ロール選択 → 初回設定 or メイン画面へ遷移
 */
function goTo(role) {
  let destination;
  if (role === 'patient') {
    const setup = localStorage.getItem('patientSetup');
    destination = setup ? 'patient.html' : 'setup-patient.html';
  } else if (role === 'watcher') {
    const setup = localStorage.getItem('watcherSetup');
    destination = setup ? 'watcher.html' : 'setup-watcher.html';
  } else {
    const setup = localStorage.getItem('medicalSetup');
    destination = setup ? 'medical.html' : 'setup-medical.html';
  }
  const card = document.querySelector('.login-card');
  card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  card.style.transform = 'scale(0.95)';
  card.style.opacity = '0';
  setTimeout(() => { window.location.href = destination; }, 300);
}

// ===========================
//  共通ステータス定義
// ===========================
const AppData = {
  healthStatus: {
    great: { label: '元気 😊',        labelText: '元気 😊',        color: '#FF6B35', emoji: '😊' },
    good:  { label: 'そこそこ元気 🙂', labelText: 'そこそこ元気 🙂', color: '#6BCB77', emoji: '🙂' },
    bad:   { label: '少し体調悪い 😟', labelText: '少し体調悪い 😟', color: '#FFD93D', emoji: '😟' },
    sick:  { label: '体調が悪い 😢',   labelText: '体調が悪い 😢',   color: '#C77DFF', emoji: '😢' },
  },
};

// ===========================
//  localStorageラッパー
//  将来Flask化するときはここのget/setをAPIに差し替えるだけでOK
// ===========================
const Store = {

  /** 当事者プロフィールを取得 */
  getPatient() {
    const raw = localStorage.getItem('patientSetup');
    return raw ? JSON.parse(raw) : null;
  },

  /** 当事者プロフィールを保存 */
  savePatient(data) {
    localStorage.setItem('patientSetup', JSON.stringify(data));
  },

  /** 体調履歴を取得（全件） */
  getHealthHistory() {
    const raw = localStorage.getItem('healthHistory');
    return raw ? JSON.parse(raw) : {};
  },

  /** 今日の体調を記録する */
  recordHealth(status) {
    const history = Store.getHealthHistory();
    history[Store.getTodayStr()] = status;
    localStorage.setItem('healthHistory', JSON.stringify(history));
  },

  /** 見守る側の設定を取得 */
  getWatcher() {
    const raw = localStorage.getItem('watcherSetup');
    return raw ? JSON.parse(raw) : null;
  },

  /** 医療者の設定を取得 */
  getMedical() {
    const raw = localStorage.getItem('medicalSetup');
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * 医療者が管理する患者リストを取得する
   * → localStorage の patientSetup をベースに動的生成
   *   + 医療者が入力した来院・処方データをマージ
   */
  getMedicalPatients() {
    // 医療者の登録済みペアコード一覧を取得
    const medical = Store.getMedical();
    if (!medical || !medical.patients || medical.patients.length === 0) return [];

    const records  = Store.getMedicalRecords();
    const history  = Store.getHealthHistory();
    const today    = Store.getTodayStr();

    // ペアコードごとに患者データを組み立て
    // デモ環境では patientSetup（1件）と照合。
    // 本番（Flask）では全ユーザーのDBを検索する想定
    const localPatient = Store.getPatient();

    return medical.patients.map(entry => {
      const code   = entry.pairCode;
      const record = records[code] || {};

      // ペアコードが一致する当事者データがあれば反映
      const matched = localPatient && localPatient.pairCode === code ? localPatient : null;
      const todayStatus = matched
        ? (history[today] || 'great')
        : (record.lastKnownStatus || 'great');

      return {
        id:        code,
        name:      matched ? matched.name    : (entry.name || 'コード:' + code),
        age:       matched ? matched.age     : (entry.age  || '不明'),
        birthday:  matched ? matched.birthday : '',
        status:    todayStatus,
        hospitals: record.hospitals || [],
        message:   record.message   || '',
      };
    });
  },

  /** 医療者の登録済みペアコードに患者を追加する */
  addMedicalPatient(pairCode, name = '') {
    const medical = Store.getMedical() || {};
    const patients = medical.patients || [];

    // 重複チェック
    if (patients.find(p => p.pairCode === pairCode)) return false;

    patients.push({ pairCode, name });
    medical.patients = patients;
    localStorage.setItem('medicalSetup', JSON.stringify(medical));
    return true;
  },

  /** medicalRecords を取得 */
  getMedicalRecords() {
    const raw = localStorage.getItem('medicalRecords');
    return raw ? JSON.parse(raw) : {};
  },

  /**
   * 医療者が来院・処方情報を保存する
   * @param {string} patientId - ペアコード
   * @param {object} data - { hospitals, message }
   */
  saveMedicalRecord(patientId, data) {
    const recordsRaw = localStorage.getItem('medicalRecords');
    const records = recordsRaw ? JSON.parse(recordsRaw) : {};
    records[patientId] = data;
    localStorage.setItem('medicalRecords', JSON.stringify(records));

    // 見守る側・見守られる側への伝達事項がある場合は通知フラグを立てる
    if (data.message) {
      // 医師名・医療機関名は呼び出し元(medical.js)から渡されたものを使用
      const doctorName  = data.doctorName  || '担当医';
      const institution = data.institution || '';

      const notifications = Store.getNotifications();
      notifications.push({
        from:        'medical',
        doctorName,
        institution,
        message:     data.message,
        date:        Store.getTodayStr(),
        read:        false,
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  },

  /** 通知一覧を取得 */
  getNotifications() {
    const raw = localStorage.getItem('notifications');
    return raw ? JSON.parse(raw) : [];
  },

  /** 今日の日付を YYYY-MM-DD 形式で返す */
  getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
};

// グローバル公開
window.AppData = AppData;
window.Store   = Store;
