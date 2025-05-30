import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';
import authRoutes from './routes/auth.routes';
import assetRoutes from './routes/asset.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import cors from 'cors';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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

app.use('/api/maintenances', maintenanceRoutes);

/**
 * @description Starts the Express server and connects to the database.
 */
const startServer = async () => {
  await connectDb(); // Connect to the database first

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();