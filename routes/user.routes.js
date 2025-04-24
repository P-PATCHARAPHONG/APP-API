const express = require('express');
const router = express.Router();
const User = require('../models/users.model');
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user.controller');

const requestLogger = require('../middleware/requestLogger');


router.use(requestLogger('user')); // 🔥 log เฉพาะ module นี้แยกไฟล์
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getuserByQr);
router.get('/profile/:userId', authMiddleware, userController.getUserProfile);
router.get('/ids/:userId', authMiddleware, userController.getAllUsersExceptSelf );
router.get('/friends/:userId', userController.getUserFriends);
router.post('/add-friend/:userId', userController.addFriend);
router.put('/push-token', async (req, res) => {
  const { userId, pushToken } = req.body;
  if (!userId || !pushToken) {
    return res.status(400).json({ error: 'Missing userId or pushToken' });
  }

  try {
    await User.findByIdAndUpdate(userId, { pushToken });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update push token' });
  }
});

module.exports = router;
