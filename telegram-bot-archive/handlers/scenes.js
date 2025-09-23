const { Scenes:{ Stage }} = require("telegraf");

const custom = require("./scenes/custom"),
    customError = require("./scenes/customError");

const stage = new Stage([
    custom,
    customError
]);


stage.action("cancel", async (ctx) => {
    try {
        await ctx.deleteMessage()
            .catch((err) => err);
        return ctx.scene.leave();
    } catch (err) {
        console.log(err);
        return ctx.reply("Произошла неизвестная ошибка").catch((err) => err);
    }
});



module.exports = stage;