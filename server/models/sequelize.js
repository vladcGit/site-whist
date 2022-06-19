const { Sequelize } = require('sequelize');

/**
 *  @type Sequelize
 */
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize({
    storage: 'models/database.db',
    dialect: 'sqlite',
    logging: false,
  });
}

module.exports = sequelize;
