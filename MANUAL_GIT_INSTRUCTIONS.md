# Инструкции для отправки обновлений в GitHub

## Проблема
PowerShell в вашей системе поврежден и не может выполнять команды.

## Решение - Ручное выполнение

### Шаг 1: Откройте командную строку (cmd)
- Нажмите Win + R
- Введите `cmd` и нажмите Enter
- ИЛИ нажмите Win + X и выберите "Command Prompt"

### Шаг 2: Перейдите в директорию проекта
```cmd
cd "C:\Users\Krassdan\Desktop\GitFood\тайский бургеркинг ( свага)"
```

### Шаг 3: Выполните git команды
```cmd
git init
git remote add origin https://github.com/krassdanek2/swagaFoodUpdate.git
git add .
git commit -m "Remove fortuna page and redirect to main menu"
git push -u origin main
```

### Альтернативный способ - Git Bash
1. Откройте Git Bash
2. Выполните те же команды

### Альтернативный способ - Visual Studio Code
1. Откройте проект в VS Code
2. Откройте терминал (Ctrl + `)
3. Выберите "Command Prompt" в выпадающем списке терминала
4. Выполните git команды

## Что было изменено
1. ✅ Удален файл `pages/fortuna.ejs`
2. ✅ Изменен маршрут `/` в `web.js`
3. ✅ Изменен маршрут `/get/discount` в `web.js`

## Результат
После выполнения команд ваши изменения будут отправлены в GitHub репозиторий https://github.com/krassdanek2/swagaFoodUpdate
