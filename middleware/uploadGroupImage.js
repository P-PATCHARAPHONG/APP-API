const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            let companyName = '';

            // รองรับทั้ง POST form-data หรือ query param
            if (req.body.company) {
                companyName = req.body.company.toString().trim().replace(/\s+/g, '_');
            } else {
                companyName = 'default';
            }

            const uploadPath = path.join(__dirname, `../uploads/group/${companyName}`);

            // ถ้ายังไม่มีโฟลเดอร์ ก็สร้าง
            fs.mkdirSync(uploadPath, { recursive: true });

            req.uploadFolder = `group/${companyName}`; // สำหรับใช้ใน DB
            cb(null, uploadPath);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

module.exports = multer({ storage });
