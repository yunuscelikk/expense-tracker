const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details
      ?.map((detail) => detail.message)
      .join(", ");
    return res.status(400).json({ error: errorMessage });
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;