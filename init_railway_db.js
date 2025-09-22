require('dotenv').config();
const { sequelize, Products } = require('./models');

const productsData = [
    { title: 'WHOPPER®', description: 'Our KING-sized burger with flame-grilled beef, tomatoes, fresh lettuce, mayonnaise, ketchup, crunchy pickles, and onions, all on a toasted sesame seed bun.', price: 411, image: '/img/whopper.png', tag: 'whopper' },
    { title: 'BIG KING XXL', description: 'Two flame-grilled beef patties, KING-sized, with melted cheese, fresh lettuce, onions, pickles, and our special BIG KING sauce, all on a toasted sesame seed bun.', price: 486, image: '/img/big-king-xxl.png', tag: 'big-king-xxl' },
    { title: 'PLANT-BASED WHOPPER®', description: 'A delicious plant-based patty, flame-grilled, with tomatoes, fresh lettuce, mayonnaise, ketchup, crunchy pickles, and onions, all on a toasted sesame seed bun.', price: 449, image: '/img/plant-based-whopper.png', tag: 'plant-based-whopper' },
    { title: 'CRISPY CHICKEN', description: 'Crispy chicken fillet, fresh lettuce, and creamy mayonnaise on a toasted sesame seed bun.', price: 336, image: '/img/crispy-chicken.png', tag: 'crispy-chicken' },
    { title: 'KING FRIES', description: 'Our famous golden, crispy fries, lightly salted.', price: 131, image: '/img/king-fries.png', tag: 'king-fries' },
    { title: 'ONION RINGS', description: 'Golden, crispy onion rings, perfect for dipping.', price: 149, image: '/img/onion-rings.png', tag: 'onion-rings' },
    { title: 'COCA-COLA', description: 'Refreshing Coca-Cola.', price: 93, image: '/img/coca-cola.png', tag: 'coca-cola' },
    { title: 'FANTA', description: 'Refreshing Fanta Orange.', price: 93, image: '/img/fanta.png', tag: 'fanta' },
    { title: 'CHOCOLATE SUNDAE', description: 'Creamy vanilla ice cream with rich chocolate sauce.', price: 123, image: '/img/chocolate-sundae.png', tag: 'chocolate-sundae' },
    { title: 'APPLE PIE', description: 'Warm apple pie with a crispy crust.', price: 104, image: '/img/apple-pie.png', tag: 'apple-pie' }
];

async function initDb() {
    console.log('🔄 Подключение к базе данных...');
    try {
        await sequelize.authenticate();
        console.log('✅ Соединение с базой данных установлено.');
        
        await sequelize.sync({ force: true });
        console.log('✅ База данных и таблицы созданы!');

        await Products.bulkCreate(productsData);
        console.log('✅ Продукты добавлены в базу данных!');
        
        console.log('🎉 Инициализация базы данных завершена успешно!');
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔌 Соединение с базой данных закрыто.');
    }
}

initDb();