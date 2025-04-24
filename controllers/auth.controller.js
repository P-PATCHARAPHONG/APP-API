const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey'; // ควรใช้ env จริง ๆ
const { sendOtpEmail } = require('../utils/mailSender');
const otpMap = new Map();


exports.register = async (req, res) => {
  const {
    username,
    password,
    friendname,
    lastname,
    email,
    phone,
    gender,
  } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const profileImage = req.file ? `/uploads/Profile/${req.file.filename}` : '';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      passwordHash: hashedPassword,
      friendname,
      lastname,
      email,
      phone,
      gender,
      profileImage,
      status: 'online',
      friendList: [],
    });

    const adminUsers = await User.find({ role: 'admin' });

    for (const admin of adminUsers) {
      if (!admin.friendList.includes(newUser._id)) {
        admin.friendList.push(newUser._id);
        await admin.save();
      }

      if (!newUser.friendList.includes(admin._id)) {
        newUser.friendList.push(admin._id);
      }
    }

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        friendname: user.friendname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        profileImage: user.profileImage,
        status: user.status,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.requestOtp = async (req, res) => {
  const { email } = req.body;

  // ✅ เช็คก่อนว่าอีเมลมีในระบบหรือไม่
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({});
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpMap.set(email, otp);

  await sendOtpEmail(email, otp);

  res.json({});
};



exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const validOtp = otpMap.get(email);

  if (validOtp && otp === validOtp) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ message: "OTP ไม่ถูกต้อง" });
  }
};


exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const validOtp = otpMap.get(email);

  if (validOtp !== otp) {
    return res.status(400).json({ message: "OTP ไม่ถูกต้อง" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

  user.passwordHash = await bcrypt.hash(newPassword, 10); // ✅ แก้ตรงนี้
  await user.save();

  otpMap.delete(email); // ลบ OTP หลังใช้เสร็จ

  res.json({ message: "ตั้งรหัสผ่านใหม่เรียบร้อย" });
};


exports.updateFullProfile = async (req, res) => {
  try {
    const {
      username,
      friendname,
      lastname,
      email,
      phone,
      gender,
      password,
    } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Missing username' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (friendname) user.friendname = friendname;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    if (req.file) {
      user.profileImage = `/uploads/Profile/${req.file.filename}`;
    }

    await user.save();

    return res.json({
      message: 'Profile and image updated successfully',
      user,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.logout = async (req, res) => {
  const { userId, pushToken } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.pushToken === pushToken) {
      user.pushToken = '';
      await user.save();
    }

    res.json({ message: 'Push token removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}
