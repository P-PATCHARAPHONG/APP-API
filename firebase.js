const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, './config/firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * ส่ง Notification ที่ประกอบข้อความไว้ให้เรียบร้อย
 * @param {string} token - FCM token ของอุปกรณ์ผู้รับ
 * @param {string} chatId - รหัสห้องแชท
 * @param {string} chatName - ชื่อห้องแชท
 * @param {string} sender - ชื่อผู้ส่ง
 * @param {string} text - ข้อความ
 */
function sendNotification(token, chatId, chatName, sender, text) {
  const message = {
    token,
    notification: {
      title: `${sender} ส่งข้อความใน ${chatName}`,
      body: text || 'แตะเพื่อดูข้อความ',
    },
    data: {
      chatId: chatId.toString(),
      chatName,
      sender,
      text,
      type: 'chat',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
    },
  };

  console.log('📤 ส่ง Notification:', message);
  return admin.messaging().send(message);
}

module.exports = { sendNotification };