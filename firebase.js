const admin = require('../firebase');

/**
 * ส่ง Notification ไปยังอุปกรณ์
 * @param {string} token - FCM token
 * @param {string} chatId - ID ของห้องแชท
 * @param {string} chatName - ชื่อห้องแชท
 * @param {string} sender - ผู้ส่ง
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
