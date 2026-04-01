import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
dotenv.config();

const app = express();

// Core middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Middlewares
app.use('/api/v1/auth', authRoutes);
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});



export default app;