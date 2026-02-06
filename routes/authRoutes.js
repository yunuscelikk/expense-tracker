const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimit");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  refreshSchema,
} = require("../validators/auth.schema");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, authController.getMe);

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.registerUser,
);
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.loginUser,
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refreshTokenHandler,
);
router.post("/logout", authMiddleware, authController.logout);

router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
