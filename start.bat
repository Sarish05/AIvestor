@echo off
echo Starting AIvestor Application...

:: Create Python virtual environment if it doesn't exist
if not exist "finai-assistant\server\venv" (
    echo Creating Python virtual environment...
    cd finai-assistant\server
    python -m venv venv
    call venv\Scripts\activate
    pip install -r ..\requirements.txt
    cd ..\..
) else (
    echo Python virtual environment exists.
)

:: Start Python Chatbot Server
echo Starting Chatbot Server...
start cmd /k "cd finai-assistant\server && venv\Scripts\activate && python app.py"

:: Start Stock Data Server
echo Starting Stock Data Server...
start cmd /k "python stock-data-server.py"

:: Start Upstox Server
echo Starting Upstox Server...
start cmd /k "node upstox-server.js"

:: Install frontend dependencies if needed
if not exist "finai-assistant\node_modules" (
    echo Installing frontend dependencies...
    cd finai-assistant
    npm install
    cd ..
)

:: Start Frontend
echo Starting Frontend...
start cmd /k "cd finai-assistant && npm start"

echo AIvestor is starting up. Please wait...
echo Frontend will be available at: http://localhost:3000
echo Chatbot Server will be available at: http://localhost:5000
echo Stock Data Server will be available at: http://localhost:5001
echo Upstox Server will be available at: http://localhost:5002