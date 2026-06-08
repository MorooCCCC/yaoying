@echo off
title 爻影 - 启动中...
echo ========================================
echo     爻影 - AI 六爻占卜应用
echo ========================================
echo.
echo 正在启动服务器，请稍候...
echo.
cd /d "d:\clawprj\yao-vision"
start http://localhost:3000
npm run dev
pause
