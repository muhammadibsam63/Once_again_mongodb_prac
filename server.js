
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// ---------- CORS ----------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://login-signup-mongodb-frontend.vercel.app',
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('Blocked CORS origin:', origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// CORS must run before security middleware and API routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ---------- SECURITY ----------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ---------- RATE LIMIT ----------
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  })
);

// ---------- API ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ---------- HEALTH CHECK ----------
app.get('/api/health', (req, res) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const database = states[mongoose.connection.readyState] || 'unknown';
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---------- ROOT ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard API is running',
    health: '/api/health',
  });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error('Request error:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong.'
        : err.message || 'Internal server error',
  });
});

// Connect once when this module loads.
// Vercel invokes the exported Express app; local development uses app.listen().
await connectDB();

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
}

export default app;
