const express = require('express');
const Player = require('../models/Player');
const Room = require('../models/Room');
const shuffleCards = require('./shuffleCards');
const { sendNotification } = require('../socket');

const app = express();

const suites = {
  H: 'Hearts',
  D: 'Diamonds',
  S: 'Spades',
  C: 'Clubs',
};

const getCardValue = (card) => {
  const value = card[0];
  if (!isNaN(value)) return value;
  else if (value === 'A') return 'Ace';
  else if (value === 'K') return 'King';
  else if (value === 'Q') return 'Queen';
  else if (value === 'J') return 'Jack';
  else if (value === 'T') return 'Ten';
};

app.post('/vote', async (req, res) => {
  try {
    const { vote, playerId } = req.body;
    const player = await Player.findByPk(playerId);

    // todo: check if the player can vote that amount
    await player.update({ initial_score: vote });
    res.status(200).json({ message: 'update complete' });
  } catch (e) {
    res.status(500).json(e);
  }
});

const compareCards = (a, b, firstSuite, atu = null) => {
  if (atu) {
    if (a[1] === atu[1] && b[1] !== atu[1]) return -1;
    else if (a[1] !== atu[1] && b[1] === atu[1]) return 1;
  }

  if (a[1] === firstSuite[0] && b[1] !== firstSuite[0]) return -1;
  else if (a[1] !== firstSuite[0] && b[1] === firstSuite[0]) return 1;

  if (a[0] === 'A') return -1;
  if (b[0] === 'A') return 1;

  if (a[0] === 'K') return -1;
  if (b[0] === 'K') return 1;

  if (a[0] === 'Q') return -1;
  if (b[0] === 'Q') return 1;

  if (a[0] === 'J') return -1;
  if (b[0] === 'J') return 1;

  if (a[0] === 'T') return -1;
  if (b[0] === 'T') return 1;

  return a.charCodeAt(0) > b.charCodeAt(0) ? -1 : 1;
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

    // calculeaza ordinea jucatorilor
    if (room.getDataValue('first_player_index')) {
      const firstPlayer = allPlayers.filter(
        (p) =>
          p.getDataValue('index_order') ===
          room.getDataValue('first_player_index')
      )[0];
      firstPlayerIndex = allPlayers.indexOf(firstPlayer);
    } else {
      firstPlayerIndex = (room.getDataValue('round') - 1) % allPlayers.length;
    }

    let turns = [];
    for (let i = firstPlayerIndex; i < allPlayers.length; i++) {
      turns.push(allPlayers[i]);
    }

    for (let i = 0; i < firstPlayerIndex; i++) {
      turns.push(allPlayers[i]);
    }

    // calculeaza cartea castigatoare
    cards = room.getDataValue('cards').split(',');
    cards.sort((a, b) =>
      compareCards(a, b, cards[0][1], room.getDataValue('atu'))
    );
    const winningCard = cards[0];

    const winningPlayer =
      turns[room.getDataValue('cards').split(',').indexOf(winningCard)];

    const prevScore = winningPlayer.getDataValue('final_score') || 0;
    await winningPlayer.update({ final_score: prevScore + 1 });
    await room.update({
      cards: null,
      first_player_index: winningPlayer.index_order,
    });
    sendNotification(
      room.getDataValue('id'),
      `${winningPlayer.getDataValue('name')} won with ${getCardValue(
        winningCard
      )} of ${suites[winningCard[1]]}`
    );
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
      await room.update({
        round: room.getDataValue('round') + 1,
        first_player_index: null,
      });
      await shuffleCards(room.getDataValue('id'));
    }
    await res.status(200).json({ message: 'update complete' });
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = app;
