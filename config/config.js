const connection = {
  username: "root",
  password: "$4tfTbasDrDsadwdwdwHBNtdlt",
  database: "bot",
  host: "localhost",
  port: "3306",
  dialect: "mysql",
  timezone: "+03:00",
  dialectOptions: {
    charset: "utf8mb4",
  },
  logging: false
};

module.exports = {
  bot: {
    token: '7716617036:AAGdSnSKeX87dI-kczLcdXynBboWNYE24fo',
    logsGroupId: '-1002294068461',
    loggingGroupId: '-1002420495377'
  },
development: connection,
production: connection,
};
