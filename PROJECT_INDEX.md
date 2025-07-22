# AIvestor Project Index

## Project Overview
AIvestor is a comprehensive financial technology platform that combines AI-powered investment assistance, real-time stock tracking, and educational resources. The project consists of a React frontend with TypeScript, Node.js backend services, and Python-based AI/ML components.

## Project Structure

### Root Directory
```
AIvestor1/
├── .env                     # Environment variables (API keys - NOT TRACKED IN GIT)
├── .gitignore              # Git ignore rules
├── package.json            # Node.js root dependencies (Upstox server)
├── README.md               # Main project documentation
├── server.js               # Express server for Upstox API integration
├── upstox-server.js        # Dedicated Upstox API server
├── start-upstox-server.js  # Server startup script
├── start.bat               # Windows batch file for starting servers
├── stock-data-server.py    # Python server for stock data processing
└── finai-assistant/        # Main React application
```

### Frontend Application (finai-assistant/)
```
finai-assistant/
├── .env                    # Frontend environment variables (NOT TRACKED IN GIT)
├── package.json           # React app dependencies
├── tsconfig.json          # TypeScript configuration
├── requirements.txt       # Python dependencies for backend services
├── public/                # Static assets
├── src/                   # React source code
├── api/                   # Python API modules
└── server/                # Flask backend with virtual environment
```

## Technology Stack

### Frontend
- **React 18.2.0** with TypeScript
- **Chakra UI 2.8.0** for UI components
- **Framer Motion 10.12.16** for animations
- **Chart.js 4.4.8** with React Chart.js 2 for data visualization
- **React Router 6.14.0** for navigation
- **Axios 1.8.4** for HTTP requests

### Backend Services
- **Node.js/Express** for API servers
- **Python/Flask** for AI and data processing
- **WebSocket** for real-time data streaming

### External Integrations
- **Upstox API** for Indian stock market data
- **Finnhub API** for global stock data
- **Google Gemini AI** for investment advice
- **YouTube API** for educational content
- **News API** for financial news
- **Firebase** for authentication and data storage

## Key Features

### 1. Authentication & User Management
- Firebase-based authentication system
- User profiles and preferences
- Protected routes and features

### 2. Stock Market Integration
- Real-time stock data from Upstox and Finnhub APIs
- Live price tracking and historical data
- Interactive charts and technical indicators
- Portfolio management and tracking

### 3. AI-Powered Features
- **ChatBot** (`src/components/ChatBot.tsx`) - AI investment advisor using Google Gemini
- **RAG Service** (`src/services/ragService.ts`) - Retrieval-Augmented Generation for financial advice
- Personalized investment recommendations

### 4. Educational Platform
- **Education Page** (`src/pages/EducationPage.tsx`) - Comprehensive learning modules
- Interactive quizzes and progress tracking
- Investment basics, retirement planning, tax strategies
- Integration with YouTube for educational videos

### 5. Community Features
- **Community Page** (`src/pages/CommunityPage.tsx`) - Social investment platform
- User discussions and forums
- Investment challenges and leaderboards
- Live events and webinars

### 6. Trading Simulator
- **Simulator Page** (`src/pages/SimulatorPage.tsx`) - Virtual trading environment
- Paper trading with real market data
- Portfolio performance analysis
- Risk management tools

### 7. Market Discovery
- **Discovery Page** (`src/pages/DiscoveryPage.tsx`) - Market exploration
- Trending stocks and market insights
- Stock screening and filtering
- News and market analysis

## Core Components

### Navigation
- **Navigation Component** (`src/components/Navigation.tsx`) - Main navigation bar
- Responsive design with mobile support
- User authentication status integration

### Charts & Visualization
- **StockChart** (`src/components/StockChart.tsx`) - Basic stock price charts
- **EnhancedStockChart** (`src/components/EnhancedStockChart.tsx`) - Advanced charting with indicators
- **PortfolioChart** (`src/components/PortfolioChart.tsx`) - Portfolio performance visualization
- **MiniChart** (`src/components/MiniChart.tsx`) - Compact chart displays

### Data Services
- **Stock Data Service** (`src/services/stockDataService.ts`) - Stock data management
- **Upstox Service** (`src/services/upstoxService.ts`) - Upstox API integration
- **Finnhub Service** (`src/services/finnhubService.ts`) - Global market data
- **News Service** (`src/services/newsService.ts`) - Financial news aggregation

## API Keys and Environment Variables

### Root .env file:
```
UPSTOX_API_KEY=your_upstox_api_key
UPSTOX_ACCESS_TOKEN=your_upstox_access_token
UPSTOX_API_SECRET=your_upstox_secret
PORT=5001
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
REACT_APP_NEWS_API_KEY=your_news_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key
```

### Frontend .env file (finai-assistant/.env):
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key
REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key
```

## Development Setup

### Prerequisites
- Node.js 14+
- Python 3.8+
- Git

### Installation Steps
1. Clone the repository
2. Create .env files with your API keys (see examples above)
3. Install root dependencies: `npm install`
4. Navigate to finai-assistant: `cd finai-assistant`
5. Install frontend dependencies: `npm install`
6. Set up Python virtual environment for backend services
7. Install Python dependencies: `pip install -r requirements.txt`

### Running the Application
1. Start Upstox server: `npm run start-upstox`
2. Start React frontend: `npm run start-react`
3. Start Python backend (if needed): `python stock-data-server.py`

## Security Notes

### ⚠️ IMPORTANT: .env Files Security Issue RESOLVED
- **Issue**: .env files containing sensitive API keys were being tracked by Git and pushed to GitHub
- **Resolution**: Removed .env files from Git tracking using `git rm --cached`
- **Current Status**: .env files are now properly ignored and won't be pushed to GitHub
- **Action Required**: Ensure all team members have their own .env files locally

### Security Best Practices
1. Never commit API keys to version control
2. Use environment variables for all sensitive data
3. Rotate API keys regularly
4. Implement proper authentication and authorization
5. Use HTTPS in production

## Architecture Patterns

### Frontend Architecture
- **Component-based architecture** with React functional components
- **Context API** for global state management (AuthContext)
- **Custom hooks** for reusable logic
- **Service layer** for API interactions
- **Type-safe development** with TypeScript

### Backend Architecture
- **Microservices approach** with separate Node.js and Python services
- **RESTful API design** for data endpoints
- **WebSocket integration** for real-time data
- **Modular service organization**

## Future Enhancements
- Mobile app development (React Native)
- Advanced AI trading algorithms
- Social trading features
- Cryptocurrency integration
- Multi-language support
- Advanced portfolio analytics

## Contributing
1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Update this index when adding new features
4. Test all API integrations thoroughly
5. Document new environment variables

## Last Updated
July 22, 2025 - Project index created and .env security issue resolved
