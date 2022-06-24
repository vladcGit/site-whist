const Player = require('../models/Player');
const Room = require('../models/Room');

const strategyOneEightOne = (round, numberOfPlayers) => {
  let numberOfCards;

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

  return numberOfCards;
};

const strategyEightOneEight = (round, numberOfPlayers) => {
  let numberOfCards;

  // primele jocuri de 8
  if (round / numberOfPlayers <= 1) numberOfCards = 8;
  // primele jocuri intre 2 si 7
  else if (round >= numberOfPlayers + 1 && round <= numberOfPlayers + 6)
    numberOfCards = 8 - (round - numberOfPlayers);
  // jocurile de 1
  else if (round >= numberOfPlayers + 7 && round <= 2 * numberOfPlayers + 6)
    numberOfCards = 1;
  // a doua tura de jocuri intre 2 si 7
  else if (
    round >= 2 * numberOfPlayers + 7 &&
    round <= 2 * numberOfPlayers + 12
  )
    numberOfCards = round - 2 * numberOfPlayers - 5;
  // ultimul joc de 8
  else numberOfCards = 8;

  return numberOfCards;
};

//todo shuffle mai random
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
  const round = room.getDataValue('round');
  const type = room.getDataValue('type');
  if (type === '1-8-1')
    numberOfCards = strategyOneEightOne(round, numberOfPlayers);
  else numberOfCards = strategyEightOneEight(round, numberOfPlayers);

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

module.exports = shuffleCards;
