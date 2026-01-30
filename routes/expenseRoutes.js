const express = require("express")
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { createExpense, getExpenses, getExpenseById } = require("../controllers/expenseController");
const { route } = require("./authRoutes");

router.post("/expenses", authMiddleware, createExpense)

router.get("/expenses", authMiddleware, getExpenses)
router.get("/expenses/:id", authMiddleware, getExpenseById)

module.exports = router;