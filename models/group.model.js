const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  notifyPerUser: { // ✅ เปลี่ยนตรงนี้
    type: Map,
    of: Number,
    default: {}
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
