require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const uploadRoutes = require('./routes/upload.routes');
const messageGroupRoutes = require('./routes/message_group.routes');
const { router: notificationRouter } = require('./routes/notification.routes');
const connectDB = require('./config/connect');
const socketHandler = require('./socket');

const app = express();
const server = http.createServer(app);

// 🛡 Middleware Security
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// 🌐 Connect MongoDB
connectDB().catch((err) => {
  logger.error(`❌ MongoDB Connection Failed: ${err.message}`);
  process.exit(1);
});

// 🔌 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/message', messageGroupRoutes);
app.use('/api/notification', notificationRouter);

// 🧪 Test Logger
app.get('/test-log', (req, res) => {
  logger.info('🔍 Someone accessed /test-log');
  res.send('Log written!');
});

// ❌ ทดสอบ Global Error Handling
app.get('/test-error', (req, res, next) => {
  next(new Error('🔥 ทดสอบ error handler!'));
});


// ⚠️ Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl} → ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});

// 🔌 Socket.IO
require('./socket')(server);
