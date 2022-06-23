const express = require('express');
const path = require('path');
const sequelize = require('./models/sequelize');
require('dotenv').config();
const { socketConnection } = require('./socket');

// import modele
require('./models/Player');
require('./models/Room');

const app = express();
app.use(express.json());

// import rute
app.use('/api/room', require('./routes/RoomRoutes'));
app.use('/api/player', require('./routes/PlayerRoutes'));

const port = process.env.PORT || 3001;

const server = app.listen(port, async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: false });
  console.log(`Pornit pe portul ${port}`);
});

socketConnection(server);

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
