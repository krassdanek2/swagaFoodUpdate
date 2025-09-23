const { sequelize, Sequelize } = require("../models");


const productsModel = require("../models/products"),
    victimsModel = require("../models/victims"),
    logsModel = require("../models/logs"),
    cartsModel = require("../models/cart");



const params = [sequelize, Sequelize.DataTypes];

const Products = productsModel(...params),
    Logs = logsModel(...params),
    Victims = victimsModel(...params),
    Carts = cartsModel(...params);


module.exports = {
    sequelize,
    Sequelize,
    Products,
    Carts,
    Logs,
    Victims
};
