const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {createCategory, getCategories, getCategoriesById, updateCategory, deleteCategory} = require("../controllers/categoryController");

router.post("/categories", authMiddleware, createCategory)

router.get("/categories", authMiddleware, getCategories)
router.get("/categories/:id", authMiddleware, getCategoriesById)

router.put("/categories/:id", authMiddleware, updateCategory)

router.delete("/categories/:id", authMiddleware, deleteCategory)

module.exports = router;
