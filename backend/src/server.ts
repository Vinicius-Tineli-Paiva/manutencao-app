import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import authRoutes from './routes/auth.routes';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * @description Root route to check if the server is running.
 */
app.get('/', (req, res) => {
  res.send('Asset Maintenance API is running!');
});

// Use authentication routes
app.use('/api/auth', authRoutes); // All auth routes will be prefixed with /api/auth

/**
 * @description Starts the Express server and connects to the database.
 */
const startServer = async () => {
  await connectDb(); // Connect to the database first

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
  });
};

startServer();