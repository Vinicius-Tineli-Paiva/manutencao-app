import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { api } from '../api/api';
import { AxiosError } from 'axios';
import { useTheme } from '@mui/material/styles';

interface AuthResponse {
  token: string;
  message?: string;
}

interface AuthPageProps {
  onLoginSuccess: () => void;
}

function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage('');
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (tabValue === 0) { // Login
        const response = await api.post<AuthResponse>('/auth/login', { identifier: email, password });
        localStorage.setItem('jwtToken', response.data.token);
        setMessage('Login bem-sucedido!');
        onLoginSuccess();
      } else { // Registro
        await api.post<AuthResponse>('/auth/register', { username, email, password });
        setMessage('Registro bem-sucedido! Faça login agora.');
        setTabValue(0);
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = (axiosError.response?.data as { message?: string })?.message || 'Ocorreu um erro inesperado.';
      setError(errorMessage);
      console.error('Erro na autenticação:', axiosError.response?.data || axiosError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw', 
        padding: theme.spacing(2),
        boxSizing: 'border-box', 
        // Gradiente de fundo suave
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[6],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing(2),
        }}
      >
        <Typography variant="h4" component="h1" align="center" sx={{
          mb: theme.spacing(2),
          color: theme.palette.primary.main,
          fontWeight: theme.typography.fontWeightBold,
        }}>
          Gerenciamento de Manutenção
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
          Acesse sua conta ou registre-se para começar
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: theme.spacing(3) }}>
          <Tab label="Login" sx={{ px: theme.spacing(4) }} />
          <Tab label="Registrar" sx={{ px: theme.spacing(4) }} />
        </Tabs>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {tabValue === 1 && (
            <TextField
              label="Nome de Usuário"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{ mb: theme.spacing(2) }}
            />
          )}
          <TextField
            label="E-mail"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: theme.spacing(2) }}
          />
          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: theme.spacing(3) }}
          />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: theme.spacing(2) }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ width: '100%', mb: theme.spacing(2) }}>
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: theme.spacing(1.5), mt: theme.spacing(2) }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {tabValue === 0 ? (loading ? 'Entrando...' : 'Login') : (loading ? 'Registrando...' : 'Registrar')}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AuthPage;