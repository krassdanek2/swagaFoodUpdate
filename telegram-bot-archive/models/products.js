'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Products.init({
    tag: DataTypes.STRING,
    title: DataTypes.STRING,
    price: DataTypes.FLOAT,
    photo: DataTypes.TEXT,
    description: DataTypes.TEXT,
    composition: DataTypes.TEXT,
    category: DataTypes.STRING,
    categoryTitle: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Products',
  });
  return Products;
};