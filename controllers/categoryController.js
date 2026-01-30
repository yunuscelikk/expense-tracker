const { Op } = require("sequelize");
const { Category } = require("../models");

const createCategory = async (req, res) => {
    const { name, icon } = req.body;
    const userId = req.user.id;
    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }
    try {
        const existingCategory = await Category.findOne({
            where: {
                name,
                userId,
            },
        });

        if (existingCategory) {
            return res.status(409).json({
                error: "Category already exists",
            });
        }
        const category = await Category.create({
            name,
            icon,
            userId,
        });
        res.status(201).json({
            category: {
                id: category.id,
                name: category.name,
                icon: category.icon,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create category" });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: {
                userId: req.user.id
            },
            attributes: ["id", "name", "icon"],
            order: [["name", "ASC"]]
        });

        res.status(200).json({ categories });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Categories cant fetch" });
    }
}

const getCategoriesById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findOne({
            where: {
                id,
                userId: req.user.id
            },
            attributes: ["id", "name", "icon"],
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json({ category });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server error" });
    }
}

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, icon } = req.body;
    if (!name && !icon) {
        return res.status(400).json({ error: "Nothing to update" });
    }
    try {
        const category = await Category.findOne({
            where: {
                id,
                userId: req.user.id
            },
        });
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        if (name) {
            const exists = await Category.findOne({
                where: {
                    name,
                    userId: req.user.id,
                    id: { [Op.ne]: id },
                },
            });
            if (exists) {
                return res.status(409).json({ error: "Category name already exists" });
            }
        }
        await category.update({
            ...(name && {name}),
            ...(icon && {icon}),
        });
        res.status(200).json({
            category: {
                id: category.id,
                name: category.name,
                icon: category.icon,
            },
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Update failed" });
    }
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await Category.findOne({
            where: {
                id,
                userId: req.user.id
            }, attributes: ["id", "name", "icon"]
        })
        if (!category) {
            return res.status(404).json({error: "Category not found"});
        }

        const deletedCategory = category.toJSON();
        await category.destroy();

        res.status(200).json({
            message: "Category deleted successfully",
            deletedCategory,
        });
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Server error during deletion"});
    }
}

module.exports = { createCategory, getCategories, getCategoriesById, updateCategory, deleteCategory };