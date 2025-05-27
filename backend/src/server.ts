import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import authRoutes from './routes/auth.routes';
import assetRoutes from './routes/asset.routes';
import cors from 'cors';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173', // O frontend vai rodar nesta porta
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));

app.use(express.json());

/**
 * @description Root route to check if the server is running.
 */
app.get('/', (req, res) => {
  res.send('Asset Maintenance API is running!');
});

// Use authentication routes
app.use('/api/auth', authRoutes); // All auth routes will be prefixed with /api/auth

// Use asset routes
app.use('/api/assets', assetRoutes); // All asset routes will be prefixed with /api/assets and require authentication

/**
 * @description Starts the Express server and connects to the database.
 */
const startServer = async () => {
  await connectDb(); // Connect to the database first

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
    console.log(`Auth routes are available at http://localhost:${PORT}/api/auth`);
    console.log(`Asset routes are available at http://localhost:${PORT}/api/assets`);
  });
};

startServer();