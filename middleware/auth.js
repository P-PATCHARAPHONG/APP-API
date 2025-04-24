const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mySecretKey';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎶 Token', token);

  if (!token) return res.status(401).json({ message: 'Access denied. Token required.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ✔️ เก็บข้อมูล user ทั้งก้อน
    req.userId = decoded._id || decoded.id; // 👈 เพิ่มบรรทัดนี้ ให้ controller ใช้ req.userId ได้ทันที
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const uploandImage = (req, res, next) => {};

module.exports = authenticateToken;
