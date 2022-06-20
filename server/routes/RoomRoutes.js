const express = require('express');
const Player = require('../models/Player');
const Room = require('../models/Room');
const app = express();

const shuffleCards = async (roomId) => {
  let deck = [
    '2H',
    '2S',
    '2C',
    '2D',
    '3H',
    '3S',
    '3C',
    '3D',
    '4H',
    '4S',
    '4C',
    '4D',
    '5H',
    '5S',
    '5C',
    '5D',
    '6H',
    '6S',
    '6C',
    '6D',
    '7H',
    '7S',
    '7C',
    '7D',
    '8H',
    '8S',
    '8C',
    '8D',
    '9H',
    '9S',
    '9C',
    '9D',
    'TH',
    'TS',
    'TC',
    'TD',
    'JH',
    'JS',
    'JC',
    'JD',
    'QH',
    'QS',
    'QC',
    'QD',
    'KH',
    'KS',
    'KC',
    'KD',
    'AH',
    'AS',
    'AC',
    'AD',
  ];

  const room = await Room.findByPk(roomId, { include: Player });
  const jucatori = await room.getPlayers();

  const numberOfPlayers = jucatori.length;

  // elimina carti in functie de cati jucatori sunt
  deck = deck.slice(-numberOfPlayers * 8);

  //vezi cate carti trebuie impartite
  let numberOfCards;
  const round = room.getDataValue('round');

  // primele jocuri de 1
  if (round / numberOfPlayers <= 1) numberOfCards = 1;
  // primele jocuri intre 2 si 7
  else if (round >= numberOfPlayers + 1 && round <= numberOfPlayers + 6)
    numberOfCards = round - numberOfPlayers + 1;
  // jocurile de 8
  else if (round >= numberOfPlayers + 7 && round <= 2 * numberOfPlayers + 6)
    numberOfCards = 8;
  // a doua tura de jocuri intre 2 si 7
  else if (
    round >= 2 * numberOfPlayers + 7 &&
    round <= 2 * numberOfPlayers + 12
  )
    numberOfCards = 2 * numberOfPlayers + 14 - round;
  // ultimul joc de 1
  else numberOfCards = 1;

  // amesteca cartile si dupa le imparte
  deck.sort(() => {
    return 0.5 - Math.random();
  });
  for (player of jucatori) {
    const playerCards = [];
    for (let i = 0; i < numberOfCards; i++) {
      playerCards.push(deck.pop());
    }
    await player.update({ cards: playerCards.join(',') });
  }

  await room.update({ atu: deck.pop() });
};
//todo sa nu mai poata nimeni sa intre in joc daca a inceput deja
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
    await shuffleCards(id);
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

    await room.update({ is_started: true });

    return res.status(200).json({ message: 'success' });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});

app.get('/:id/shuffle', async (req, res) => {
  try {
    await shuffleCards(req.params.id);
    const room = await Room.findByPk(req.params.id, { include: Player });
    return res.json(room);
  } catch (e) {
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
