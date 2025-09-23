require('dotenv').config();

// Простой запуск только бота без веб-части
async function startBotOnly() {
    try {
        console.log('🔄 Инициализация Telegram бота...');
        
        // Инициализация базы данных
        const { sequelize } = require('./models');
        await sequelize.authenticate();
        console.log('✅ Подключение к SQLite установлено');
        
        // Синхронизация таблиц
        await sequelize.sync();
        console.log('✅ Таблицы синхронизированы');
        
        // Запуск бота
        const bot = require('./bot');
        console.log('🤖 Telegram бот запущен!');
        
    } catch (error) {
        console.error('❌ Ошибка запуска бота:', error.message);
        process.exit(1);
    }
}

startBotOnly();
