export const validate = (schema, target = 'body') => (req, res, next) => {
  try {
    if (target === 'body') {
      req.body = schema.parse(req.body);
    }

    if (target === 'params') {
      req.params = schema.parse(req.params);
    }

    if (target === 'query') {
      req.query = schema.parse(req.query);
    }

    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors,
    });
  }
};