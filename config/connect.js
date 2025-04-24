const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // ✅ แค่รอบเดียวก็พอ
    const conn = mongoose.connection;
    console.log(`✅ MongoDB Connected: ${conn.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
