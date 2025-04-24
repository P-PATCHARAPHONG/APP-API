const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message_group.controller');
const authenticateToken = require('../middleware/auth');

const requestLogger = require('../middleware/requestLogger');


router.use(requestLogger('message_group')); // 🔥 log เฉพาะ module นี้แยกไฟล์
router.get('/', authenticateToken, messageController.getAllMessages);
router.get('/group/:groupId', authenticateToken, messageController.getMessagesByGroupId);
router.post('/create/', authenticateToken, messageController.createMessage);

module.exports = router;
