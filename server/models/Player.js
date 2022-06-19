const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 30],
    },
  },
  index_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 6,
      min: 1,
    },
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  cards: {
    type: DataTypes.STRING,
    defaultValue: '',
    allowNull: false,
  },
  initial_score: {
    type: DataTypes.INTEGER,
    validate: {
      max: 8,
      min: 0,
    },
  },
  final_score: {
    type: DataTypes.INTEGER,
    validate: {
      max: 8,
      min: 0,
    },
  },
});

module.exports = Player;
