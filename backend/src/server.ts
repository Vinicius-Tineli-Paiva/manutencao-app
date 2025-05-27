import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * @description Root route to check if the server is running.
 */
app.get('/', (req, res) => {
  res.send('Asset Maintenance API está rodando!');
});

/**
 * @description Starts the Express server and connects to the database.
 */
const startServer = async () => {
  await connectDb(); // Connect to the database first

  app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta: ${PORT}`);
    console.log(`Acesse em: http://localhost:${PORT}`);
  });
};

startServer();