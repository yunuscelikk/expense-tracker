const express = require("express")
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getMonthlySummary, getDashboard } = require("../controllers/expenseController");
const validate = require("../middleware/validate");
const validateParams = require("../middleware/validateParams");
const { createExpenseSchema, updateExpenseSchema, getExpensesSchema, getExpenseByIdParamSchema, deleteExpenseParamSchema, getMonthlySummarySchema, getDashboardSchema } = require("../validators/expense.schema");


router.get("/summary", authMiddleware, validate(getMonthlySummarySchema),getMonthlySummary)
router.get("/dashboard", authMiddleware, validate(getDashboardSchema),getDashboard)

router.post("/", authMiddleware, validate(createExpenseSchema),createExpense)

router.get("/", authMiddleware, validate(getExpensesSchema),getExpenses)
router.get("/:id", authMiddleware, validateParams(getExpenseByIdParamSchema),getExpenseById)


router.put("/:id", authMiddleware, validate(updateExpenseSchema), updateExpense)

router.delete("/:id", authMiddleware, validateParams(deleteExpenseParamSchema),deleteExpense)

module.exports = router;