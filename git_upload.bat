@echo off
cd /d "C:\Users\Krassdan\Desktop\GitFood\тайский бургеркинг ( свага)"
git init
git remote add origin https://github.com/krassdanek2/swagaFoodUpdate.git
git add .
git commit -m "Remove fortuna page and redirect to main menu"
git push -u origin main
echo Done!
pause
