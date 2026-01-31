const express = require("express")
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getMonthlySummary, getDashboard } = require("../controllers/expenseController");
const validate = require("../middleware/validate");
const validateParams = require("../middleware/validateParams");
const { createExpenseSchema, updateExpenseSchema, getExpensesSchema, getExpenseByIdParamSchema, deleteExpenseParamSchema, getMonthlySummarySchema, getDashboardSchema } = require("../validators/expense.schema");


router.get("/expenses/summary", authMiddleware, validate(getMonthlySummarySchema),getMonthlySummary)
router.get("/expenses/dashboard", authMiddleware, validate(getDashboardSchema),getDashboard)

router.post("/expenses", authMiddleware, validate(createExpenseSchema),createExpense)

router.get("/expenses", authMiddleware, validate(getExpensesSchema),getExpenses)
router.get("/expenses/:id", authMiddleware, validateParams(getExpenseByIdParamSchema),getExpenseById)


router.put("/expenses/:id", authMiddleware, validate(updateExpenseSchema), updateExpense)

router.delete("/expenses/:id", authMiddleware, validateParams(deleteExpenseParamSchema),deleteExpense)

module.exports = router;