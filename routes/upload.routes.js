const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');


const requestLogger = require('../middleware/requestLogger');


router.use(requestLogger('upload')); // 🔥 log เฉพาะ module นี้แยกไฟล์
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.uploadFolder}/${req.file.filename}`;

  res.status(200).json({
    url: fileUrl,
    name: req.file.originalname,
    path: `/uploads/${req.uploadFolder}/${req.file.filename}`,
  });
});

module.exports = router;
