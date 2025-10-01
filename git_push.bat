@echo off
echo Checking git version...
git --version
echo.
echo Initializing git repository...
git init
echo.
echo Adding remote repository...
git remote add origin https://github.com/krassdanek2/swagaFoodUpdate.git
echo.
echo Adding all files...
git add .
echo.
echo Committing changes...
git commit -m "Remove fortuna page and redirect to main menu"
echo.
echo Pushing to GitHub...
git push -u origin main
echo.
echo Done! Check your GitHub repository.
pause
