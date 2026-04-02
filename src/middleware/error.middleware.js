export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate resource',
    });
  }

  if (!err.statusCode) {
    if (err.message === 'Unauthorized') statusCode = 401;
    else if (err.message === 'Forbidden') statusCode = 403;
    else if (err.message === 'Record not found') statusCode = 404;
    else if (err.message === 'User not found') statusCode = 404;
    else if (err.message === 'Invalid credentials') statusCode = 401;
    else if (err.message === 'User already exists') statusCode = 409;
    else statusCode = 500;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};