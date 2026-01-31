const Joi = require("joi");

exports.createExpenseSchema = Joi.object({
    amount: Joi.number().positive().precision(2).required(),
    categoryId: Joi.number().integer().required(),
    description: Joi.string().max(255).optional(),
    date: Joi.date().required(),
});

exports.updateExpenseSchema = Joi.object({
    amount: Joi.number().positive().precision(2).optional(),
    categoryId: Joi.number().integer().optional(),
    description: Joi.string().max(255).optional(),
    date: Joi.date().optional(),
});

exports.getExpensesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),

    sortBy: Joi.string()
        .valid("createdAt", "amount")
        .default("createdAt"),

    order: Joi.string()
        .valid("asc", "desc")
        .default("desc"),

    categoryId: Joi.number().integer().positive().optional(),

    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
});

exports.getExpenseByIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

exports.deleteExpenseParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

exports.getMonthlySummarySchema = Joi.object({
    year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .required(),

    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required(),
});

exports.getDashboardSchema = Joi.object({
    year: Joi.number()
        .integer()
        .min(2000)
        .max(2100)
        .optional(),

    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .optional(),
});