const express = require('express');
const Player = require('../models/Player');
const Room = require('../models/Room');
const shuffleCards = require('./shuffleCards');
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

const compareCards = (a, b, firstSuite, atu = null) => {
  if (atu) {
    if (a[1] === atu[1] && b[1] !== atu[1]) return 1;
    else if (a[1] !== atu[1] && b[1] === atu[1]) return -1;
  }

  if (a[1] === firstSuite[1] && b[1] !== firstSuite[1]) return 1;
  else if (a[1] !== firstSuite[1] && b[1] === firstSuite[1]) return -1;

  if (a[0] === 'A') return 1;
  if (b[0] === 'A') return -1;

  if (a[0] === 'K') return 1;
  if (b[0] === 'K') return -1;
  else return a.charCodeAt(0) > b.charCodeAt(0) ? 1 : -1;
};

app.post('/play/:id', async (req, res) => {
  try {
    const { card } = req.body;
    const player = await Player.findByPk(req.params.id);
    const room = await Room.findByPk(player.getDataValue('RoomId'));

    // se adauga cartea pe masa
    let cards = room.getDataValue('cards');
    if (cards) cards = cards.split(',');
    else cards = [];
    cards.push(card);
    cards = cards.join(',');
    await room.update({ cards });

    // se scoate cartea din cele ale jucatorului
    let playerCards = player
      .getDataValue('cards')
      .split(',')
      .filter((c) => c !== card)
      .join(',');
    await player.update({ cards: playerCards });

    // daca e ultima carte din tura aia
    let allPlayers = await room.getPlayers();
    const firstPlayerNumber = allPlayers[0].getDataValue('cards').length;
    const playerWithSameNumber = allPlayers.filter(
      (p) => p.getDataValue('cards').length === firstPlayerNumber
    );
    if (playerWithSameNumber.length !== allPlayers.length)
      return res.status(200).json({ message: 'update complete' });

    cards = room.getDataValue('cards').split(',');
    cards.sort((a, b) =>
      compareCards(b, a, cards[0][1], room.getDataValue('atu'))
    );
    const winningCard = cards[0];

    const winningPlayer =
      allPlayers[room.getDataValue('cards').split(',').indexOf(winningCard)];

    const prevScore = winningPlayer.getDataValue('final_score') || 0;
    await winningPlayer.update({ final_score: prevScore + 1 });
    await room.update({ cards: null });

    // if all cards have been played then go to next round
    //todo daca se ard toti sa se repete runda

    if (firstPlayerNumber === 0) {
      for (let p of allPlayers) {
        const bidded = p.getDataValue('initial_score');
        const actual = p.getDataValue('final_score') || 0;
        const prevPoints = p.getDataValue('points');

        let score;
        if (bidded === actual) score = 5 + actual;
        else score = Math.abs(actual - bidded) * -1;

        await p.update({
          points: prevPoints + score,
          initial_score: null,
          final_score: 0,
        });
      }
      await room.update({ round: room.getDataValue('round') + 1 });
      await shuffleCards(room.getDataValue('id'));
    }
    await res.status(200).json({ message: 'update complete' });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = app;
