const AppError = require("../utils/appError");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isJoi) {
    return res.status(400).json({
      status: "fail",
      error: err.details.map((d) => d.message).join(", "),
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      status: "fail",
      error: err.errors.map((e) => e.message).join(", "),
    });
  }

  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    err = new AppError("Token expired", 401);
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err.message,
  });
};
