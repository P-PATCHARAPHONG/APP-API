const express = require('express');
const router = express.Router();
const uploadGroupImage = require('../middleware/uploadGroupImage');
const groupController = require('../controllers/group.controller');
const authenticateToken = require('../middleware/auth');

const requestLogger = require('../middleware/requestLogger');


router.use(requestLogger('group')); // 🔥 log เฉพาะ module นี้แยกไฟล์
router.get('/', groupController.getAllGroups);
router.get('/ids/:userId', groupController.getGroupsByUserId);
router.get('/members/:groupId', authenticateToken, groupController.getGroupMembers);
router.post('/:groupId/add-members', groupController.addMembersToGroup);
router.delete('/:groupId/remove-member/:memberId', groupController.removeMemberFromGroup);
router.post('/create', authenticateToken, uploadGroupImage.single('image'), groupController.createGroup);
router.patch('/clear-notify/:userId/:groupId', groupController.clearNotifyCount);


module.exports = router;