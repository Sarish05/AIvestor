import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SimulatorPage from './pages/SimulatorPage';
import UpstoxCallback from './pages/UpstoxCallback';
import AuthPage from './pages/AuthPage'; // Added import statement for AuthPage
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import DiscoveryPage from './pages/DiscoveryPage';
import EducationPage from './pages/EducationPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NewsPage from './pages/NewsPage';
// Create a custom theme with dark mode as default
const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  colors: {
    darkBlue: {
      50: '#E6F1FF',
      100: '#CCEEFF',
      200: '#99DDFF',
      300: '#66CCFF',
      400: '#33BBFF',
      500: '#00AAFF',
      600: '#0088CC',
      700: '#006699',
      800: '#051c3d',
      900: '#001133',
    },
  },
  styles: {
    global: {
      body: {
        bg: '#02071A',
        color: 'white',
      }
    }
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/upstox/callback" element={<UpstoxCallback />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App; 