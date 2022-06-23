const express = require('express');
const Player = require('../models/Player');
const Room = require('../models/Room');
const shuffleCards = require('./shuffleCards');
const app = express();

app.post('/new', async (req, res) => {
  try {
    const getRandomId = async () => {
      let flag = true;
      while (flag) {
        const number = Math.floor(1000 + Math.random() * 9000);
        const room = await Room.findByPk(number);
        if (room == null) return number;
      }
    };
    const id = await getRandomId();
    const room = await Room.create({ id });
    res.status(201).json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

app.post('/:id/player/new', async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (room == null)
      return res.status(400).json({ error: 'That room does not exist' });
    if (room.getDataValue('is_started'))
      return res.status(400).json({ error: 'That game has already started' });
    const { name } = req.body;
    const players = await room.getPlayers();
    const index_order = players.length + 1;
    const player = await Player.create({
      name,
      index_order,
      RoomId: id,
    });

    return res.status(201).json(player);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

app.get('/:id/start', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, { include: Player });
    if (!room)
      return res.status(400).json({ error: 'That room does not exist' });

    const players = await room.getPlayers();

    if (players.length < 3 && players.length > 6)
      return res
        .status(400)
        .json({ error: 'The number of players must be between 3 and 6' });

    await shuffleCards(req.params.id);
    await room.update({ is_started: true });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

app.get('/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Player }],
    });
    if (!room)
      return res.status(400).json({ error: 'That room does not exist' });
    return res.status(200).json(room);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

module.exports = app;
