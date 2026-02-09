const { Expense, Category } = require("../models");
const { Op, fn, col } = require("sequelize");

const createExpense = async (req, res) => {
  const { amount, categoryId, description, date } = req.body;

  try {
    if (!amount || !categoryId) {
      return res
        .status(400)
        .json({ error: "Amount and categoryId are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }
    const category = await Category.findOne({
      where: {
        id: categoryId,
        userId: req.user.id,
      },
    });
    if (!category) {
      return res
        .status(404)
        .json({ error: "Category not found or not authorized" });
    }

    const expense = await Expense.create({
      amount,
      description,
      categoryId,
      userId: req.user.id,
      date: date || new Date(),
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Expense creation failed" });
  }
};

const getExpenses = async (req, res) => {
  const { dateRange, categoryIds, sortOrder } = req.query;

  const where = {
    userId: req.user.id,
  };

  try {
    /* ------------------------
       DATE RANGE FILTER
    ------------------------ */
    if (dateRange) {
      const now = new Date();
      let from;

      switch (dateRange) {
        case "today":
          from = new Date(now.setHours(0, 0, 0, 0));
          break;

        case "week":
          from = new Date();
          from.setDate(from.getDate() - 7);
          break;

        case "month":
          from = new Date();
          from.setMonth(from.getMonth() - 1);
          break;

        default:
          from = null; // all
      }

      if (from) {
        where.date = {
          [Op.gte]: from,
        };
      }
    }

    /* ------------------------
       CATEGORY IDS FILTER
       ?categoryIds=1,3,5
    ------------------------ */
    if (categoryIds) {
      const ids = categoryIds
        .split(",")
        .map((id) => Number(id))
        .filter(Boolean);

      if (ids.length === 0) {
        return res.status(400).json({ error: "Invalid categoryIds" });
      }

      // ownership check
      const validCategories = await Category.findAll({
        where: {
          id: { [Op.in]: ids },
          userId: req.user.id,
        },
        attributes: ["id"],
      });

      if (validCategories.length !== ids.length) {
        return res
          .status(403)
          .json({ error: "Invalid or unauthorized category" });
      }

      where.categoryId = {
        [Op.in]: ids,
      };
    }

    /* ------------------------
       SORTING
    ------------------------ */
    let order = [["date", "DESC"]]; // default

    if (sortOrder === "newestfirst") {
      order = [["date", "DESC"]];
    }

    if (sortOrder === "highestamount") {
      order = [["amount", "DESC"]];
    }

    /* ------------------------
       QUERY
    ------------------------ */
    const expenses = await Expense.findAll({
      where,
      attributes: ["id", "amount", "description", "date"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
      order,
    });

    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Expenses can't fetch" });
  }
};

const getExpenseById = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findOne({
      where: {
        id,
        userId: req.user.id,
      },
      attributes: ["id", "amount", "description", "date"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
    });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, categoryId, description, date } = req.body;

  try {
    const expense = await Expense.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.user.id,
        },
      });

      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }
    await expense.update({
      amount,
      categoryId,
      description,
      date,
    });
    const updatedExpense = await Expense.findOne({
      where: {
        id,
        userId: req.user.id,
      },
      attributes: ["id", "amount", "description", "date"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
    });
    res.status(200).json(updatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Expense update failed" });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findOne({
      where: {
        id,
        userId: req.user.id,
      },
      attributes: ["id", "amount", "description", "date"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await expense.destroy();

    res.status(200).json({
      message: "Expense deleted successfully",
      deletedExpense: expense,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Expense deletion failed" });
  }
};

const getMonthlySummary = async (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      error: "year and month are required",
    });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  try {
    const total = await Expense.sum("amount", {
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const byCategory = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["categoryId", [fn("SUM", col("amount")), "totalAmount"]],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
      group: ["categoryId", "category.id"],
    });

    res.status(200).json({
      year,
      month,
      totalAmount: total || 0,
      categories: byCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summary fetch failed" });
  }
};

const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  /* =======================
     MONTH RANGES
  ======================= */
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    /* =======================
       THIS MONTH TOTAL
    ======================= */
    const thisMonthTotal =
      (await Expense.sum("amount", {
        where: {
          userId,
          date: { [Op.between]: [startOfThisMonth, endOfThisMonth] },
        },
      })) || 0;

    /* =======================
       LAST MONTH TOTAL
    ======================= */
    const lastMonthTotal =
      (await Expense.sum("amount", {
        where: {
          userId,
          date: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
        },
      })) || 0;

    /* =======================
       PERCENTAGE CHANGE
    ======================= */
    let percentageChange = null;
    if (lastMonthTotal > 0) {
      percentageChange =
        ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    }

    /* =======================
       DAILY AVERAGE (FIXED)
    ======================= */
    const daysPassed = now.getDate();
    const dailyAverage =
      daysPassed > 0 ? Number((thisMonthTotal / daysPassed).toFixed(2)) : null;

    /* =======================
       CATEGORY BREAKDOWN
    ======================= */
    const categoryBreakdown = await Expense.findAll({
      where: {
        userId,
        date: { [Op.between]: [startOfThisMonth, endOfThisMonth] },
      },
      attributes: ["categoryId", [fn("SUM", col("amount")), "totalAmount"]],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
      group: ["categoryId", "category.id"],
      order: [[fn("SUM", col("amount")), "DESC"]],
    });

    const topCategory = categoryBreakdown[0] || null;

    /* =======================
       WEEKLY SPENDING BREAKDOWN (FINAL FIX)
    ======================= */
    const weekStart = new Date(now);
    const dayOfWeek = weekStart.getDay(); // 0=Sun, 1=Mon
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    weekStart.setDate(weekStart.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const weeklyExpenses = await Expense.findAll({
      where: {
        userId,
        date: { [Op.between]: [weekStart, endOfToday] },
      },
      attributes: ["amount", "date"],
    });

    const weeklyMap = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    weeklyExpenses.forEach((expense) => {
      const day = days[new Date(expense.date).getDay()];
      weeklyMap[day] += Number(expense.amount);
    });

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const weeklySpendingBreakdown = orderedDays.map((day) => ({
      day,
      amount: Number(weeklyMap[day].toFixed(2)),
    }));

    /* =======================
       RECENT EXPENSES
    ======================= */
    const recentExpenses = await Expense.findAll({
      where: { userId },
      attributes: ["id", "amount", "description", "date"],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "icon"],
        },
      ],
      order: [["date", "DESC"]],
      limit: 5,
    });

    /* =======================
       RESPONSE
    ======================= */
    res.status(200).json({
      thisMonth: {
        total: thisMonthTotal,
        comparedToLastMonth: percentageChange,
      },
      dailyAverage,
      topCategory,
      categoryBreakdown,
      recentExpenses,
      weeklySpendingBreakdown,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getDashboard,
};
