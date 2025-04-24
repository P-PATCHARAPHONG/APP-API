// config/mail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // หรือใช้ SMTP ตามบริษัท: smtp.office365.com, smtp.mailgun.org ฯลฯ
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = transporter;
