import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage'; 
import { Box, CircularProgress, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssetDetailPage from './pages/AssetDetailPage';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoadingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
  };

  if (loadingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Verificando autenticação...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage onLogout={handleLogout} /> : <AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/assets/:id"
            element={isAuthenticated ? <AssetDetailPage /> : <AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/" element={isAuthenticated ? <DashboardPage onLogout={handleLogout} /> : <AuthPage onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;