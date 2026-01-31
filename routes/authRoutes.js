const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, authController.getMe)

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router;