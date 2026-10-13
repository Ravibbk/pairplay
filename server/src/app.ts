import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible script/image loading for avatars
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // In development allow any localhost
      if (env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      if (origin === env.CORS_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for deployment demo flexibility
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Catch-all 404 for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
