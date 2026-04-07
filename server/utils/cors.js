const normalizeOrigin = (value) => value?.trim().replace(/\/+$/, '').toLowerCase();

export const parseOrigins = (...values) => {
  const origins = values
    .filter(Boolean)
    .flatMap(value => String(value).split(','))
    .map(origin => normalizeOrigin(origin))
    .filter(Boolean);

  return [...new Set(origins)];
};

export const buildAllowedOrigins = ({ corsOrigins, isProduction, localOrigins = ['http://localhost:5173'] }) =>
  parseOrigins(corsOrigins, ...(isProduction ? [] : localOrigins));

export const createCorsOptions = (allowedOrigins) => ({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*')) {
      return callback(null, origin || true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, origin);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});
