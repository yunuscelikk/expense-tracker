const { Expense, Category } = require("../models")
const { Op, fn, col } = require("sequelize");


const createExpense = async (req, res) => {
    const { amount, categoryId, description, date } = req.body;

    try {
        if (!amount || !categoryId) {
            return res.status(400).json({ error: "Amount and categoryId are required" });
        }
        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than 0" });
        }
        const category = await Category.findOne({
            where: {
                id: categoryId,
                userId: req.user.id
            },
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found or not authorized" });
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
        console.error(err)
        res.status(500).json({ error: "Expense creation failed" });
    }
}

const getExpenses = async (req, res) => {
  const { categoryId, from, to, sort } = req.query;

  const where = {
    userId: req.user.id,
  };

  try {
    //Category filter + ownership check
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          userId: req.user.id,
        },
        attributes: ["id"],
      });

      if (!category) {
        return res.status(400).json({ error: "Invalid category" });
      }

      where.categoryId = Number(categoryId);
    }

    //Date range filter
    if (from && to) {
      where.date = {
        [Op.between]: [new Date(from), new Date(to)],
      };
    }

    //Sorting (default: newest first)
    let order = [["date", "DESC"]];

    if (sort === "oldest") {
      order = [["date", "ASC"]];
    }

    if (sort === "amount_desc") {
      order = [["amount", "DESC"]];
    }

    if (sort === "amount_asc") {
      order = [["amount", "ASC"]];
    }

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
    res.status(500).json({ error: "Expenses cant fetch" });
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
                }
            ]
        });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.status(200).json(expense);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Server error" });
    }
}

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
      attributes: [
        "categoryId",
        [fn("SUM", col("amount")), "totalAmount"],
      ],
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

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    //This month total
    const thisMonthTotal = await Expense.sum("amount", {
      where: {
        userId,
        date: {
          [Op.between]: [startOfThisMonth, endOfThisMonth],
        },
      },
    });

    //Last month total
    const lastMonthTotal = await Expense.sum("amount", {
      where: {
        userId,
        date: {
          [Op.between]: [startOfLastMonth, endOfLastMonth],
        },
      },
    });

    //Percentage change
    let percentageChange = null;
    if (lastMonthTotal > 0) {
      percentageChange =
        ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    }

    //Category breakdown (this month)
    const categoryBreakdown = await Expense.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [startOfThisMonth, endOfThisMonth],
        },
      },
      attributes: [
        "categoryId",
        [fn("SUM", col("amount")), "totalAmount"],
      ],
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

    //Top category
    const topCategory = categoryBreakdown[0] || null;

    //Last 5 expenses
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

    res.status(200).json({
      thisMonth: {
        total: thisMonthTotal || 0,
        comparedToLastMonth: percentageChange,
      },
      topCategory,
      categoryBreakdown,
      recentExpenses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
};

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense, getMonthlySummary, getDashboard };