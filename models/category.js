'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Category.hasMany(models.Expense, {
        foreignKey: "categoryId",
        as: "expenses",
      });
    }
  }
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false      
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    icon: DataTypes.STRING,
    allowNull: false
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: false
  });
  return Category;
};