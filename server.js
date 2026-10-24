
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel's proxy for correct client IP handling
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// ---------- CORS CONFIGURATION ----------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://login-signup-mongodb-frontend.vercel.app',
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without Origin (e.g. server-to-server requests)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ---------- SECURITY MIDDLEWARE ----------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---------- RATE LIMITING ----------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api', generalLimiter);

// ---------- API ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ---------- HEALTH CHECK ----------
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;

  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---------- API 404 HANDLER ----------
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- FRONTEND STATIC HOSTING ----------
const frontendPath = path.join(__dirname, 'web', 'build');

app.use(express.static(frontendPath));

// SPA fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  }

  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).send(
          'Frontend build not found. Please build the frontend first.'
        );
      }
    }
  });
});

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Unhandled error:', err.message);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong.'
        : err.message || 'Internal server error',
  });
});

// ---------- START SERVER ----------
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend build path: ${frontendPath}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

export default app;
