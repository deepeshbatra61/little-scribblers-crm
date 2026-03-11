@echo off
echo.
echo  Setting up Little Scribblers CRM...
echo.

echo  [1/3] Installing root dependencies...
call npm install
if errorlevel 1 goto error

echo.
echo  [2/3] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 goto error
cd ..

echo.
echo  [3/3] Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 goto error
cd ..

echo.
echo  ============================================
echo    Setup complete!
echo  ============================================
echo.
echo  To start the app, run:
echo    npm run dev
echo.
echo  Then open http://localhost:5173
echo.
echo  Login credentials (default password: LittleScribblers2024)
echo    shady              - Account Manager (sees all tickets)
echo    bani               - Director, Ashfield
echo    director_burwood   - Director, Burwood
echo    director_strathfield - Director, Strathfield
echo    director_newtown   - Director, Newtown
echo    director_marrickville - Director, Marrickville
echo.
goto end

:error
echo.
echo  Error during setup. Please check the output above.
pause
exit /b 1

:end
pause
