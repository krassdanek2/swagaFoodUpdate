const connection = {
  dialect: "sqlite",
  storage: process.env.DATABASE_URL || "./database.sqlite",
  logging: false
};

module.exports = {
  database: connection,
  bot: {
    token: process.env.BOT_TOKEN || '8044664539:AAGFh94EzR3Z39VhUfUPBF0RlhJNmvSUgos',
    logsGroupId: process.env.LOGS_GROUP_ID || '-4797804295',
    loggingGroupId: process.env.LOGGING_GROUP_ID || '-1002970379665'
  },
  development: connection,
  production: connection,
};
