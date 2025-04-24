const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chatId = req.query.chatId || 'default';
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    const folder = isImage ? 'images' : 'files';

    const uploadPath = path.join(__dirname, '../uploads/chatsGroup', chatId, folder);
    fs.mkdirSync(uploadPath, { recursive: true });

    req.uploadFolder = `chatsGroup/${chatId}/${folder}`;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

module.exports = multer({ storage });
