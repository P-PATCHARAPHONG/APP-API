const mongoose = require('mongoose');
const Message = require('../models/messge_group.model');
const Group = require('../models/group.model');

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getMessagesByGroupId = async (req, res) => {
  const rawGroupId = req.params.groupId?.trim();
  const limit = parseInt(req.query.limit) || 30;
  const before = parseInt(req.query.before);

  if (!mongoose.Types.ObjectId.isValid(rawGroupId)) {
    return res.status(400).json({ message: 'Invalid Group ID' });
  }

  const objectId = new mongoose.Types.ObjectId(rawGroupId);
  const filter = { 'metadata.groupId': objectId };

  if (!isNaN(before)) {
    filter.chatOrder = { $lt: before };
  }

  try {
    const messages = await Message.find(filter)
      .sort({ chatOrder: -1 })
      .limit(limit)
      .populate('author.id', 'username friendname lastname profileImage status');

    const formatted = messages.map(doc => {
      const sender = doc.author.id;
      return {
        id: doc._id.toString(),
        type: doc.type,
        text: doc.text || '',
        createdAt: new Date(doc.createdAt).getTime(),
        chatOrder: doc.chatOrder,
        author: {
          id: sender?._id?.toString() ?? 'unknown',
          username: sender?.username || '',
          friendname: sender?.friendname || '',
          profileImage: sender?.profileImage || '',
          status: sender?.status || '',
        },
        uri: doc.uri || '',
        name: doc.name || '',
        size: doc.size || 0,
        metadata: {
          groupId: doc.metadata.groupId?.toString(),
          senderName: doc.metadata.senderName || '',
        }
      };
    });

    res.status(200).json({ data: formatted });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};


exports.createMessage = async (req, res) => {
  try {
    const {
      chatId,
      type,
      text,
      createdAt,
      uri,
      name,
      size,
      mimeType,
      author,
    } = req.body;

    if (!chatId || !author?.id || !type || !createdAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const groupId = new mongoose.Types.ObjectId(chatId);

    // 1. ดึง Group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // 2. เพิ่ม notifyPerUser สำหรับทุกคน (ยกเว้นคนที่ส่ง)
    group.notifyPerUser = group.notifyPerUser || {};
    group.members.forEach(members => {
      const memberStr = String(members);
      const authorStr = String(author.id);

      if (memberStr !== authorStr) {
        const currentValue = group.notifyPerUser.get(memberStr) || 0;
        group.notifyPerUser.set(memberStr, currentValue + 1);
      }
    });

    // 3. อัปเดต lastMessage + lastMessageAt
    group.lastMessage = type === 'text' ? text : (type === 'image' ? '[ส่งรูปภาพ]' : '[แนบไฟล์]');
    group.lastMessageAt = new Date(createdAt);

    // 4. บันทึกกลับ
    await group.save();

    // 5. หา chatOrder ล่าสุด แล้ว +1
    const lastMessage = await Message.findOne({ 'metadata.groupId': groupId })
      .sort({ chatOrder: -1 })
      .select('chatOrder');

    const nextChatOrder = lastMessage?.chatOrder + 1 || 1;

    // 6. fallback สำหรับไฟล์
    const safeName = name || `file_${Date.now()}`;
    const safeSize = typeof size === 'number' && size > 0 ? size : 0;
    const safeMimeType = mimeType || (type === 'image' ? 'image/jpeg' : 'application/octet-stream');

    const newMessage = new Message({
      type,
      text: type === 'text' ? text : '',
      uri: uri || '',
      name: type !== 'text' ? safeName : '',
      size: type !== 'text' ? safeSize : 0,
      mimeType: type !== 'text' ? safeMimeType : '',
      createdAt: new Date(createdAt),
      chatOrder: nextChatOrder,
      author: {
        id: new mongoose.Types.ObjectId(author.id),
      },
      metadata: {
        groupId: groupId,
        senderName: author.friendname || 'unknown',
      },
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message created successfully',
      data: newMessage,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

