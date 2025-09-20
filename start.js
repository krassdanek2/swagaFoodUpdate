require('dotenv').config();

// Инициализация базы данных при запуске
async function initDatabase() {
    try {
        console.log('🔄 Подключение к базе данных...');
        console.log('📍 Railway Environment:', process.env.RAILWAY_ENVIRONMENT);
        console.log('📍 Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
        console.log('📍 Database Public URL:', process.env.DATABASE_PUBLIC_URL ? 'SET' : 'NOT SET');
        
        const { sequelize, Products } = require('./models');
        
        // Проверяем подключение
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных установлено');
        
        // Синхронизируем таблицы
        await sequelize.sync();
        console.log('✅ Таблицы синхронизированы');
        
        // Проверяем, есть ли продукты в базе
        const productCount = await Products.count();
        
        if (productCount === 0) {
            console.log('🔄 Инициализация базы данных...');
            
            const productsData = [
                { title: 'WHOPPER®', description: 'Our KING-sized burger with flame-grilled beef, tomatoes, fresh lettuce, mayonnaise, ketchup, crunchy pickles, and onions, all on a toasted sesame seed bun.', price: 10.99, image: '/img/whopper.png', tag: 'whopper' },
                { title: 'BIG KING XXL', description: 'Two flame-grilled beef patties, KING-sized, with melted cheese, fresh lettuce, onions, pickles, and our special BIG KING sauce, all on a toasted sesame seed bun.', price: 12.99, image: '/img/big-king-xxl.png', tag: 'big-king-xxl' },
                { title: 'PLANT-BASED WHOPPER®', description: 'A delicious plant-based patty, flame-grilled, with tomatoes, fresh lettuce, mayonnaise, ketchup, crunchy pickles, and onions, all on a toasted sesame seed bun.', price: 11.99, image: '/img/plant-based-whopper.png', tag: 'plant-based-whopper' },
                { title: 'CRISPY CHICKEN', description: 'Crispy chicken fillet, fresh lettuce, and creamy mayonnaise on a toasted sesame seed bun.', price: 8.99, image: '/img/crispy-chicken.png', tag: 'crispy-chicken' },
                { title: 'KING FRIES', description: 'Our famous golden, crispy fries, lightly salted.', price: 3.49, image: '/img/king-fries.png', tag: 'king-fries' },
                { title: 'ONION RINGS', description: 'Golden, crispy onion rings, perfect for dipping.', price: 3.99, image: '/img/onion-rings.png', tag: 'onion-rings' },
                { title: 'COCA-COLA', description: 'Refreshing Coca-Cola.', price: 2.49, image: '/img/coca-cola.png', tag: 'coca-cola' },
                { title: 'FANTA', description: 'Refreshing Fanta Orange.', price: 2.49, image: '/img/fanta.png', tag: 'fanta' },
                { title: 'CHOCOLATE SUNDAE', description: 'Creamy vanilla ice cream with rich chocolate sauce.', price: 3.29, image: '/img/chocolate-sundae.png', tag: 'chocolate-sundae' },
                { title: 'APPLE PIE', description: 'Warm apple pie with a crispy crust.', price: 2.79, image: '/img/apple-pie.png', tag: 'apple-pie' }
            ];
            
            await Products.bulkCreate(productsData);
            console.log('✅ Продукты добавлены в базу данных!');
        } else {
            console.log('✅ База данных уже инициализирована');
        }
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error.message);
        console.error('📋 Полная ошибка:', error);
        
        // На Railway продолжаем работу даже с ошибкой БД
        if (process.env.RAILWAY_ENVIRONMENT) {
            console.log('⚠️ Продолжаем работу без базы данных на Railway');
        } else {
            throw error;
        }
    }
}

// Инициализируем базу данных и запускаем приложение
initDatabase().then(() => {
    const web = require("./web");
    const bot = require("./bot");
}).catch(error => {
    console.error('Ошибка запуска:', error);
    process.exit(1);
});