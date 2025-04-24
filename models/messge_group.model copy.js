const mongoose = require('mongoose');

const messagegroupSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  senderName: {
    type: String,
    required: true,
  },

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

  fileName: {
    type: String,
    default: '',
  },

  fileSize: {
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

  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messagegroupSchema);
