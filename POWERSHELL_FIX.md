# Исправление PowerShell

## Проблема
PowerShell показывает ошибки синтаксиса из-за поврежденного профиля или проблем с кодировкой.

## Решения

### 1. Сброс профиля PowerShell
```powershell
# Удалите профиль PowerShell
Remove-Item $PROFILE -Force -ErrorAction SilentlyContinue

# Создайте новый профиль
New-Item -Path $PROFILE -Type File -Force
```

### 2. Изменение политики выполнения
```powershell
# Запустите PowerShell от имени администратора
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Использование cmd вместо PowerShell
```cmd
# Откройте cmd и выполните:
cd "C:\Users\Krassdan\Desktop\GitFood\тайский бургеркинг ( свага)"
git init
git add .
git commit -m "Remove fortuna page and redirect to main menu"
```

### 4. Использование Git Bash
- Откройте Git Bash
- Перейдите в директорию проекта
- Выполните git команды

## Рекомендация
Используйте cmd или Git Bash для выполнения git команд, пока не исправите PowerShell.
