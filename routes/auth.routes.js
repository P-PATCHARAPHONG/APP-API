const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const upload = require('../middleware/uploadProfile');
const auth = require('../middleware/auth');
const requestLogger = require('../middleware/requestLogger');

router.use(requestLogger('auth'));

router.get('/users', authController.getAllUsers);
router.post('/register', upload.single('image'), authController.register);
router.post('/login', authController.login);
router.put('/profile/full', upload.single('image'), authController.updateFullProfile);
router.post('/logout', auth, authController.logout);

// 🔹 OTP Reset Flow
router.post('/request-otp', authController.requestOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password-with-otp', authController.resetPasswordWithOtp);

module.exports = router;
