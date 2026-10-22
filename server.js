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

// ---------- Security & parsing middleware ----------
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts from Vite build if needed
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// CORS – needed mainly in development when Vite runs on a different origin
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? false // same-origin in production
      : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// General rate limiter
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

// ---------- API Routes (MUST be registered before static/SPA) ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check – reports server + DB status without leaking secrets
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
        ? 'connecting'
        : dbState === 3
          ? 'disconnecting'
          : 'disconnected';

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  });
});

// JSON 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- Frontend static hosting & SPA fallback ----------
const frontendPath = path.join(__dirname, 'web', 'build');

app.use(express.static(frontendPath));

// SPA fallback – serve index.html for any non-API route
// Compatible with Express 4 (path-to-regexp v0/v1 style)
app.get('*', (req, res, next) => {
  // Safety: never serve HTML for /api paths (already handled above, but belt & suspenders)
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  }

  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      // If build folder is missing (e.g. first run without build)
      res.status(404).send(
        'Frontend build not found. Run "npm run build" first, or use "npm run dev" for development.'
      );
    }
  });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong.'
        : err.message || 'Internal server error',
  });
});

// ---------- Start server ----------
const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Frontend build path: ${frontendPath}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
