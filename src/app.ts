import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import apiRoutes from './routes/api';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { apiLimiter } from './middlewares/rate-limiter.middleware';
import { AppError } from './utils/app-error.util';
const app: Application = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'connect-src': ["'self'"],
      },
    },
    frameguard: {
      action: 'sameorigin',
    },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
const buildCorsOrigins = (): string[] => {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FRONTEND_ORIGIN must be set in production');
    }
    return ['http://localhost:5173'];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

const allowedOrigins = buildCorsOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (ví dụ: curl, mobile app, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/v1/api', apiLimiter);

try {
  const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Docs available at http://localhost:8083/api-docs');
} catch (e) {
  console.error('Swagger load failed:', e instanceof Error ? e.message : e);
}

app.use('/v1/api', apiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      errors: null,
    });
  }

  if (err instanceof AppError) {
    const appErr = err as AppError;
    return res.status(appErr.statusCode).json({
      success: false,
      message: appErr.message,
      errors: null,
    });
  }

  console.error('[UnhandledError]', err);
  const error = err as Error;
  return res.status(500).json({
    success: false,
    message: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau',
    errors:
      process.env.NODE_ENV === 'development' ? (error.stack ?? null) : null,
  });
});

export default app;
