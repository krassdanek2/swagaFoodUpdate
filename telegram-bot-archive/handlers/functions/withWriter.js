const { Markup} = require("telegraf");
module.exports = async function (log, user) {
    const url = `https://t.me/${user.username}`;


    return Markup.inlineKeyboard([
        [Markup.button.url(`⏳ Вбивает ${user.username}`, url)]
    ]).reply_markup;
};
