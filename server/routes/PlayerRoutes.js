const express = require('express');
const Player = require('../models/Player');
const Room = require('../models/Room');
const app = express();

app.post('/vote', async (req, res) => {
  try {
    const { vote, playerId } = req.body;
    const player = await Player.findByPk(playerId);
    await player.update({ initial_score: vote });
    res.status(200).json({ message: 'update complete' });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = app;
