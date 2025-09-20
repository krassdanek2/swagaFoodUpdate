const { sequelize, Products, Victims, Logs, Carts } = require('./config/database');

async function initDatabase() {
    try {
        console.log('🔄 Инициализация базы данных...');
        
        // Синхронизируем модели
        await sequelize.sync({ force: true });
        console.log('✅ Таблицы созданы');
        
        // Добавляем тестовые продукты
        const products = [
            { title: 'Big Bang Double Beef', price: 9.99, tag: 'big-bang-double-beef', description: 'Двойной бифштекс с соусом' },
            { title: 'The Angus Farmhouse Double', price: 12.99, tag: 'angus-farmhouse-double', description: 'Ангус бифштекс с фермерскими овощами' },
            { title: 'Veggie Royle Bakon King', price: 8.99, tag: 'veggie-royle-bakon-king', description: 'Вегетарианский бургер' },
            { title: 'King Fish', price: 10.99, tag: 'king-fish', description: 'Рыбный бургер' },
            { title: 'Caramel Sundae', price: 4.99, tag: 'caramel-sundae', description: 'Карамельное мороженое' }
        ];
        
        for (const product of products) {
            await Products.create(product);
        }
        console.log('✅ Продукты добавлены');
        
        console.log('🎉 База данных успешно инициализирована!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        process.exit(1);
    }
}

initDatabase();
