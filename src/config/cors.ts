const buildCorsOrigins = (): string[] => {
  const raw = process.env.FRONTEND_ORIGIN;
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:5174',
    'http://localhost:8083', // Backend server itself (Swagger UI)
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8083',
  ];

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FRONTEND_ORIGIN must be set in production');
    }
    return defaultOrigins;
  }

  const customOrigins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return [...defaultOrigins, ...customOrigins];
};

export const allowedOrigins = buildCorsOrigins();
