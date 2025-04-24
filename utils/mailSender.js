const transporter = require("../config/mail");

// ✅ ส่งอีเมลแบบ OTP
exports.sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"TAT Notify" <${process.env.EMAIL_USER}>`,
    to,
    subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน",
    html: `
      <h2>รหัส OTP สำหรับรีเซ็ตรหัสผ่าน</h2>
      <p>คุณได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีนี้</p>
      <p style="font-size: 24px; font-weight: bold; color: #28a745;">${otp}</p>
      <p>กรุณานำรหัสนี้ไปกรอกในแอป TAT Notify</p>
      <p>หากคุณไม่ได้ร้องขอ โปรดละเว้นอีเมลนี้</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
