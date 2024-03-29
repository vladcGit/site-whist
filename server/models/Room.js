const sequelize = require('./sequelize');
const { DataTypes } = require('sequelize');
const Player = require('./Player');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  is_started: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_finished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  type: {
    type: DataTypes.ENUM('1-8-1', '8-1-8'),
    defaultValue: '1-8-1',
  },
  card_on_forehead: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  //todo
  has_prizes: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  atu: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  round: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: {
      min: 1,
      max: 36,
    },
  },
  cards: {
    type: DataTypes.STRING,
  },
  first_player_index: {
    type: DataTypes.INTEGER,
  },
});

Room.hasMany(Player, { onDelete: 'CASCADE' });

module.exports = Room;
