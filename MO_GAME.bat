@echo off
setlocal
cd /d "%~dp0"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
 start "" "%EDGE%" "%~dp0index.html"
 exit /b
)
set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
 start "" "%EDGE%" "%~dp0index.html"
 exit /b
)
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
 start "" "%CHROME%" "%~dp0index.html"
 exit /b
)
echo Khong tim thay Chrome/Edge trong thu muc mac dinh.
echo Mo Chrome, nhan Ctrl+O va chon index.html trong thu muc nay.
pause