'use strict';
const bcrypt = require("bcrypt");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // user can add more than one expense
      User.hasMany(models.Expense, {
        foreignKey: "userId",
        as: "expenses",
      });
      // user can create more than one category
      User.hasMany(models.Category, {
        foreignKey: "userId",
        as: "categories",
      });
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
    underscored: false,

    defaultScope: {
      attributes: {exclude: ["password"]},
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
    hooks: {
      // hash password before create user
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // hash password before update user
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};