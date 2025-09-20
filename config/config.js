// Локальная разработка - SQLite, Railway - PostgreSQL
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const isRailway = process.env.RAILWAY_ENVIRONMENT;

const connection = isRailway ? {
  // PostgreSQL для Railway
  dialect: "postgres",
  url: process.env.DATABASE_URL,
  logging: false,
  dialectOptions: {
    ssl: false
  }
} : {
  // SQLite для локальной разработки
  dialect: "sqlite",
  storage: "./database.sqlite",
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
