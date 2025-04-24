// routes/notification.routes.js
const express = require('express');
const router = express.Router();

const tokenMap = {}; // ⬅️ export อันนี้ออกไปใช้ใน server.js

const requestLogger = require('../middleware/requestLogger');


router.use(requestLogger('notification')); // 🔥 log เฉพาะ module นี้แยกไฟล์
router.post('/token', (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        return res.status(400).json({ message: 'userId และ token จำเป็นต้องมี' });
    }

    tokenMap[userId] = token;
    console.log(`✅ Token saved: ${userId} -> ${token}`);
    return res.status(200).json({ message: 'Token saved successfully' });
});

module.exports = {
    router,
    tokenMap,
};
