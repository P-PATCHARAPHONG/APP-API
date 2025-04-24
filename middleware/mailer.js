// mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail", // หรือ SMTP ของคุณเอง
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendResetEmail = async (to, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to,
        subject: "รีเซ็ตรหัสผ่านของคุณ",
        html: `
      <h3>คุณได้รับคำขอรีเซ็ตรหัสผ่าน</h3>
      <p>คลิกที่ลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน:</p>
      <a href="${resetLink}">รีเซ็ตรหัสผ่าน</a>
      <p>ลิงก์นี้จะหมดอายุใน 15 นาที</p>
    `,
    };

    return transporter.sendMail(mailOptions);
};
