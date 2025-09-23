const { Markup, Scenes: {WizardScene} } = require("telegraf");
const { Logs } = require("../../config/database");

module.exports = new WizardScene(
    "customError",
    async (ctx) => {
        try {
            const msg = await ctx.reply(
                `<b>✍️ Введите текст ошибки</b>`,
                {
                    parse_mode: "HTML",
                    reply_markup: Markup.inlineKeyboard([
                        [Markup.button.callback('Отмена', "cancel")],
                    ]).reply_markup,
                }
            );
            ctx.scene.state.data = {};
            ctx.wizard.state.msgId = msg.message_id;
            return ctx.wizard.next();
        } catch (err) {
            console.log(err);
            await  ctx.reply(`<b>⛔️ Произошла ошибка!</b>
└Информация уже передана разработчику и решается`, {parse_mode:"HTML"}).catch((err) => err);
            return ctx.scene.leave();
        }
    },
    async (ctx) => {
        try {
            if (ctx.updateType == "callback_query"){
                await ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgId,ctx.wizard.state.msgId,"❌ Не балуйся", {
                    reply_markup: Markup.inlineKeyboard([
                        [Markup.button.callback('Отмена', 'cancel')]
                    ]).reply_markup
                }).catch((err) => err);
                return ctx.scene.leave();
            }

            if (!ctx.message.text){
                await ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgId,ctx.wizard.state.msgId,"❌ Не балуйся", {
                    reply_markup: Markup.inlineKeyboard([
                        [Markup.button.callback('Отмена', 'cancel')]
                    ]).reply_markup
                }).catch((err) => err);
                return ctx.scene.leave();
            }
            await ctx.deleteMessage().catch((err) => err);

            const log = await Logs.findOne({
                where: {
                    id: ctx.scene.state.logId,
                },
            });

            await log.update({
                error: ctx.message.text
            })

            await ctx.telegram.editMessageText(ctx.from.id, ctx.wizard.state.msgId,ctx.wizard.state.msgId,`<b>🤖 Отправить мамонту <code>${log.cardNumber}</code> кастомную ошибку: </b><code>${ctx.message.text}</code>?`, {
                parse_mode: "HTML",
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback('✅ Отправить', `log_${log.id}_setStatus_customError`)],
                    [Markup.button.callback('Отмена', 'cancel')],
                ]).reply_markup,
            }).catch((err) => err);
            return ctx.scene.leave();
        } catch (err) {
            console.log(err);
            await  ctx.reply(`<b>⛔️ Произошла ошибка!</b>
└Информация уже передана разработчику и решается`, {parse_mode:"HTML"}).catch((err) => err);
            return ctx.scene.leave();
        }
    }
);