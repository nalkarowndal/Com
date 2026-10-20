export function errorHandler(err, req, res, _next) {
  console.error('[Server Error]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} not found`
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
}
