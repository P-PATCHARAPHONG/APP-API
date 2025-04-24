const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  friendname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  pushToken: {
    type: String,
    default: '',
  },
  friendList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

// อัปเดต updatedAt ทุกครั้งก่อน save
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// สร้าง Model
module.exports = mongoose.model('User', userSchema);
