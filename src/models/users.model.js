const { DataTypes } = require("sequelize");
const { UserBookHistory } = require("./user-book-history.model");
const sequelize = require("../bootstrap/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.hasMany(UserBookHistory, { foreignKey: "userId", as: "userBookHistory" });

module.exports = { User };
