const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const validateParams = require("../middleware/validateParams");
const {createCategory, getCategories, getCategoriesById, updateCategory, deleteCategory} = require("../controllers/categoryController");
const { createCategorySchema, updateCategorySchema, getCategoriesSchema, categoryIdParamSchema, deleteCategoryParamSchema } = require("../validators/category.schema");

router.post("/categories", authMiddleware, validate(createCategorySchema), createCategory)

router.get("/categories", authMiddleware, validate(getCategoriesSchema), getCategories)
router.get("/categories/:id", authMiddleware,validateParams(categoryIdParamSchema), getCategoriesById)

router.put("/categories/:id", authMiddleware, validate(updateCategorySchema), updateCategory)

router.delete("/categories/:id", authMiddleware, validateParams(deleteCategoryParamSchema), deleteCategory)

module.exports = router;
