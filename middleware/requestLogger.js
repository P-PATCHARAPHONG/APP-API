const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const requestLogger = (moduleName = 'general') => {
  return (req, res, next) => {
    const user = req.user?.username || 'anonymous'; // กรณีใช้ auth middleware
    const logLine = `[${new Date().toISOString()}] [${req.method}] ${req.originalUrl} → user=${user}`;
    
    // Log ลง winston ปกติ
    logger.info(logLine);

    // 🔄 เขียนแยกไฟล์ log ตามโมดูล เช่น logs/group.log
    const moduleLogPath = path.join(__dirname, `../logs/${moduleName}.log`);
    fs.appendFile(moduleLogPath, logLine + '\n', (err) => {
      if (err) console.error('❌ Error writing module log:', err.message);
    });

    next();
  };
};

module.exports = requestLogger;
