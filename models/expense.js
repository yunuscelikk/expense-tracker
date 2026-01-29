'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    // expense belongs to a single user
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user"
      });
      // expense belongs to a single category
      Expense.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category"
      });
    }
  }
  Expense.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'Expenses',
    timestamps: true,
      indexes: [
        { fields: ["userId"] },
        { fields: ["userId", "date"] },
      ],
  });
  return Expense;
};