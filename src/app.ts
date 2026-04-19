import 'reflect-metadata';
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
import { allowedOrigins } from './config/cors';
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
        'connect-src': ["'self'", 'ws:', 'wss:'],
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError(`CORS: origin '${origin}' not allowed`, 403));
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
  const swaggerUiOptions = {
    persistAuthorization: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      deepLinking: true,
    },
  };
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerUiOptions),
  );
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

  // Handle Mongoose Validation Error
  if (err instanceof Error && err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: null,
    });
  }

  // Handle Mongoose Cast Error
  if (err instanceof Error && err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không hợp lệ',
      errors: null,
    });
  }

  console.error('[UnhandledError]', err);
  // Never send stack trace to frontend - only to server logs
  return res.status(500).json({
    success: false,
    message: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau',
    errors: null,
  });
});

export default app;
