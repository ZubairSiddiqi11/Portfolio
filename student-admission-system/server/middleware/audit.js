const { query } = require('../config/database');

const auditLog = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the action after response is sent
    if (req.user && req.method !== 'GET') {
      logAudit(req, res.statusCode);
    }
    originalSend.call(this, data);
  };

  next();
};

const logAudit = async (req, statusCode) => {
  try {
    const action = `${req.method} ${req.originalUrl}`;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress;

    await query(
      `INSERT INTO audit_logs (user_id, action, table_name, ip_address, user_agent, new_data) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.user.id,
        action,
        extractTableName(req.originalUrl),
        ipAddress,
        userAgent,
        JSON.stringify({ statusCode, body: req.body })
      ]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

const extractTableName = (url) => {
  const parts = url.split('/');
  if (parts.includes('students')) return 'students';
  if (parts.includes('tasks')) return 'tasks';
  if (parts.includes('documents')) return 'documents';
  if (parts.includes('applications')) return 'applications';
  if (parts.includes('users')) return 'users';
  return 'unknown';
};

module.exports = auditLog;