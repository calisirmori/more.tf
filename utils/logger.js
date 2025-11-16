// Structured logger for cleaner CloudWatch logs
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ level: 'INFO', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({ level: 'ERROR', message, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({ level: 'WARN', message, ...meta, timestamp: new Date().toISOString() }));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify({ level: 'DEBUG', message, ...meta, timestamp: new Date().toISOString() }));
    }
  }
};

module.exports = logger;
