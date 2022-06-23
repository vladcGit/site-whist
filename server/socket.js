const Player = require('./models/Player');
const Room = require('./models/Room');

let io;

exports.socketConnection = (server) => {
  io = require('socket.io')(server);
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
};

exports.sendNotification = (id, message) => {
  io.to('room-' + id).emit('notification', message);
};
