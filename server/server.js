const express = require('express');
const path = require('path');
const sequelize = require('./models/sequelize');
require('dotenv').config();

// import modele
const Player = require('./models/Player');
const Room = require('./models/Room');

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

// web-socket
const io = require('socket.io')(server);
io.on('connection', (socket) => {
  const { id } = socket.handshake.query;
  const roomName = 'room-' + id;

  socket.join(roomName);

  //todo sa se trimita datele diferit in functie de player
  //probabil merge daca mai adaug ceva la query

  io.to(roomName).emit('connection', null);
  socket.on('update', async function (message) {
    let response;
    try {
      const { id } = JSON.parse(message);
      const room = await Room.findByPk(parseInt(id), {
        include: [{ model: Player }],
      });

      response = JSON.stringify(room);
    } catch (e) {
      console.log(e);
      response = JSON.stringify(e);
    } finally {
      io.to(roomName).emit('room', response);
    }
  });
});

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
