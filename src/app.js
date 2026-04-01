import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { authenticate } from './middleware/auth.middleware.js';
import { allowRoles } from './middleware/role.middleware.js';
import recordRoutes from './modules/record/record.routes.js';
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
app.use('/api/v1/records', recordRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});



app.get(
  '/api/v1/test/viewer',
  authenticate,
  allowRoles('VIEWER', 'ANALYST', 'ADMIN'),
  (req, res) => {
    res.json({ message: 'Viewer access granted' });
  }
);

app.get(
  '/api/v1/test/admin',
  authenticate,
  allowRoles('ADMIN'),
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);


export default app;