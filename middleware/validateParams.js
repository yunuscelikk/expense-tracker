const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params, {
    abortEarly: false,
  });

  if (error) {
    const message = error.details.map(d => d.message).join(", ");
    return res.status(400).json({ error: message });
  }

  req.params = value;
  next();
};

module.exports = validateParams;
