const { Markup} = require("telegraf");
module.exports = async function (log) {
    return Markup.inlineKeyboard([
        [Markup.button.callback('Взять', `log_take_${log.id}`)],
    ]).reply_markup;
};
