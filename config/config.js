// Локальная разработка - SQLite, Railway - MongoDB
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const isRailway = process.env.RAILWAY_ENVIRONMENT;

// Для совместимости с Sequelize (будет использоваться только локально)
const connection = {
  // SQLite для локальной разработки
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false
};

module.exports = {
  database: connection,
  bot: {
    token: process.env.BOT_TOKEN || '8477608805:AAF6-UwbhdQTClns7RQqeBXMbiJ1zPWrJAA',
    logsGroupId: process.env.LOGS_GROUP_ID || '-1002636314382',
    loggingGroupId: process.env.LOGGING_GROUP_ID || '-4664599553'
  },
  development: connection,
  production: connection,
};
