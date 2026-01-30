const express = require("express")
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getMonthlySummary, getDashboard } = require("../controllers/expenseController");


router.get("/expenses/summary", authMiddleware, getMonthlySummary)
router.get("/expenses/dashboard", authMiddleware, getDashboard)

router.post("/expenses", authMiddleware, createExpense)

router.get("/expenses", authMiddleware, getExpenses)
router.get("/expenses/:id", authMiddleware, getExpenseById)


router.put("/expenses/:id", authMiddleware, updateExpense)

router.delete("/expenses/:id", authMiddleware, deleteExpense)

module.exports = router;