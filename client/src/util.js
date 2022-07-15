function formatDate(date) {
  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  const dataCalendaristica = [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');

  const ora = [
    padTo2Digits(date.getHours()),
    padTo2Digits(date.getMinutes()),
  ].join(':');

  return `${dataCalendaristica}, ${ora}`;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

// cate carti a primit fiecare jucator la inceputul rundei
const getMaxNumberOfCards = (room) => {
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

  if (room.type === '1-8-1')
    return strategyOneEightOne(room.round, room.Players.length);
  else if (room.type === '8-1-8')
    return strategyEightOneEight(room.round, room.Players.length);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export { formatDate, hexToRgb, getMaxNumberOfCards, sleep };
