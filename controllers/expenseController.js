const { Expense, Category } = require("../models")
const { Op } = require("sequelize");


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
    const { categoryId, from, to } = req.query;

    const where = {
        userId: req.user.id,
    };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (from && to) {
        where.date = {
            [Op.between]: [from, to],
        };
    }
    try {
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
            order: [["date", "DESC"]],
        });
        res.status(200).json(expenses);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Expenses cant fetch" });
    }
}

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
            return res.status(404).json({error: "Expense not found"});
        }

        res.status(200).json(expense);
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Server error"});
    }
}

module.exports = { createExpense, getExpenses, getExpenseById };