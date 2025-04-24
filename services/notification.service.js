const admin = require('../firebase');

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
