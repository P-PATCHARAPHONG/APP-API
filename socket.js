const socketIo = require('socket.io');
const logger = require('./utils/logger');
const Group = require('./models/group.model');
const User = require('./models/users.model');
const { sendNotification } = require('./firebase');

const activeUsersInChat = {};

module.exports = (server) => {
  const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    logger.info(`✅ Client connected: ${socket.id}`);

    socket.on('join', (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      logger.info(`🚪 ${socket.id} joined room: ${chatId}`);
      const userId = socket.handshake.query.userId;
      if (userId) {
        activeUsersInChat[chatId] ??= new Set();
        activeUsersInChat[chatId].add(userId);
        logger.info(`👤 User ${userId} is active in chat ${chatId}`);
      }
    });

    socket.on('sendMsg', async (msg) => {
      const { chatId, author, text } = msg;
      io.to(chatId).emit('sendMsgServer', { ...msg, chatId, types: 'otherMsg' });

      try {
        const group = await Group.findById(chatId).lean();
        if (!group || !group.members) return;

        const users = await User.find({
          _id: { $in: group.members.filter(id => id.toString() !== author.id) },
          pushToken: { $exists: true, $ne: '' },
        }).lean();

        for (const user of users) {
          const isUserInChat = activeUsersInChat[chatId]?.has(user._id.toString()) || false;
          logger.info(`👀 ตรวจสอบ: memberId=${user._id}`);
          if (!isUserInChat && user.pushToken?.includes(':APA91')) {
            console.log('📤 Preparing to send notification:');
            console.log('Token:', user.pushToken);
            console.log('Sender:', author.friendname);
            console.log('Chat ID:', chatId);
            console.log('Group Name:', group?.name);
            await sendNotification(
              user.pushToken,
              chatId,
              group?.name || 'ห้องแชท',
              author.friendname || 'ใครบางคน',
              text || '[ข้อความ]'
            );
          }
        }
      } catch (err) {
        logger.error(`❌ Failed to process message: ${err.message}`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.warn(`❌ Client disconnected: ${socket.id} (${reason})`);
      const userId = socket.handshake.query.userId;
      if (userId) {
        for (const chatId in activeUsersInChat) {
          activeUsersInChat[chatId]?.delete(userId);
          logger.info(`👤 User ${userId} left chat ${chatId}`);
          if (activeUsersInChat[chatId]?.size === 0) {
            delete activeUsersInChat[chatId];
          }
        }
      }
    });
  });
};
