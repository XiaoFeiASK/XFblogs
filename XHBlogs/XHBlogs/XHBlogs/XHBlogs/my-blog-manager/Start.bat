@echo off
cd /d "%~dp0"

echo [调试] 脚本所在目录：%~dp0
echo [调试] 开始检测Python环境...

py -3.10 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [状态] 正在调用 Python 3.10 环境...
    py -3.10 run_me.py
    goto end
)

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [状态] 正在调用默认 Python 环境...
    python run_me.py
    goto end
)

echo [错误] 未找到 Python 环境，请确保已安装并添加到系统PATH！
echo [排查步骤]
echo    1. 确认安装Python 3.10+
echo    2. 安装时勾选 "Add Python to PATH"
echo    3. 重启命令行/电脑后重试
pause
exit /b 1

:end
echo [完成] 程序执行完成
pause
exit /b 0