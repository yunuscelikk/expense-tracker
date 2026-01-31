const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.schema");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, authController.getMe)

router.post("/register", validate(registerSchema), authController.registerUser);
router.post("/login", validate(loginSchema), authController.loginUser);

module.exports = router;