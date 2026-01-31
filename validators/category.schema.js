const Joi = require("joi");

exports.createCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    icon: Joi.string().trim().max(50).optional()
});

exports.updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    icon: Joi.string().trim().max(50).optional(),
}).min(1);

exports.getCategoriesSchema = Joi.object({});

exports.categoryIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

exports.deleteCategoryParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
})