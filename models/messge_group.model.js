const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },

  text: {
    type: String,
    default: '',
  },

  uri: {
    type: String,
    default: '',
  },

  name: {
    type: String,
    default: '',
  },

  size: {
    type: Number,
    default: 0,
  },

  mimeType: {
    type: String,
    default: '',
  },

  width: {
    type: Number,
    default: 0,
  },

  height: {
    type: Number,
    default: 0,
  },

  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },

  metadata: {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    }
  },

  // ✅ เพิ่ม chatOrder ตรงนี้
  chatOrder: {
    type: Number,
    required: true,
    index: true, // ✅ เพื่อให้ query เร็วขึ้น
  },

  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('MessageGroup', messageSchema);
