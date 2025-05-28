import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Tabs, Tab } from '@mui/material';
import { api } from '../api/api'; 
import { AxiosError } from 'axios';

interface AuthResponse {
  token: string;
  message?: string; // Para a resposta de registro, se houver
}
interface AuthPageProps {
  onLoginSuccess: () => void; 
}

function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [tabValue, setTabValue] = useState(0);
  const [username, setUsername] = useState(''); // Usado apenas para registro
  const [email, setEmail] = useState('');     // Usado para login e registro
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

    try {
      if (tabValue === 0) { // Login
        // MUDANÇA AQUI: Envie 'email' como 'identifier'
        const response = await api.post<AuthResponse>('/auth/login', { identifier: email, password });
        localStorage.setItem('jwtToken', response.data.token);
        setMessage('Login bem-sucedido! Token salvo.');
        console.log('Token de acesso:', response.data.token);
        setUsername(''); // Limpa campos após login
        setEmail('');
        setPassword('');
        onLoginSuccess();
      } else { // Registro
        await api.post<AuthResponse>('/auth/register', { username, email, password });
        setMessage('Registro bem-sucedido! Faça login agora.');
        setTabValue(0);
        setUsername(''); // Limpa campos após registro
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Erro na autenticação:', axiosError.response?.data || axiosError.message);
      // Certifique-se de que a mensagem de erro do backend é capturada corretamente
      setError((axiosError.response?.data as { message?: string })?.message || 'Ocorreu um erro inesperado.');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Gerenciamento de Manutenção
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Registrar" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          {tabValue === 1 && ( // Campo de Nome de Usuário apenas para registro
            <TextField
              label="Nome de Usuário"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          {/* Campo de E-mail agora é usado para Login E Registro */}
          <TextField
            label="E-mail"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email} // <-- Importante: este é o valor do campo E-mail
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {message && (
            <Typography color="primary" align="center" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
          >
            {tabValue === 0 ? 'Login' : 'Registrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AuthPage;