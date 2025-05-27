import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage'; 
import { Box } from '@mui/material';

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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Carregando...</Box>;
  }

  return (
    <React.Fragment>
      {isAuthenticated ? (<DashboardPage onLogout={handleLogout} />) : (<AuthPage onLoginSuccess={handleLoginSuccess}/> )}
    </React.Fragment>
  );
}

export default App;