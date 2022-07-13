const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const Player = require('../models/Player');
const Room = require('../models/Room');
const axios = require('axios');

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';

describe('Jocuri de 1 pentru 3 jucatori', () => {
  const addPlayer = async (id, name) => {
    const res = await axios.post(`/api/room/${id}/player/new`, { name });
    return res;
  };

  const playerVote = async (player, vote) => {
    const res = await axios.post(`/api/player/vote`, {
      vote,
      playerId: player.getDataValue('id'),
    });
    return res;
  };

  const playCard = async (player, card) => {
    await axios.post(`/api/player/play/${player.getDataValue('id')}`, { card });
  };

  let id;
  before(async () => {
    const resRoom = await axios.post(`/api/room/new`);
    id = resRoom.data.id;

    await addPlayer(id, 'Vlad');
    await addPlayer(id, 'Chris');
    await addPlayer(id, 'Adriana');

    await axios.put(`/api/room/${id}`, {
      type: '1-8-1',
      card_on_forehead: true,
    });
    await axios.get(`/api/room/${id}/start`);
  });

  it('should be 3 players', async () => {
    const room = await Room.findByPk(id, { include: Player });
    const players = await room.getPlayers();
    expect(players.length).to.equal(3);
  });

  it('each player should have one card', async () => {
    const room = await Room.findByPk(id, { include: Player });
    const players = await room.getPlayers({ raw: true });
    expect(players.filter((p) => p.cards.length !== 2).length).to.equal(0);
  });

  /*
  it('should not be able to vote how many you want', async () => {
    const room = await Room.findByPk(id, { include: Player });
    const players = await room.getPlayers();

    await room.update({ atu: 'JD' });
    await players[0].update({ cards: 'TC' });
    await players[1].update({ cards: 'KD' });
    await players[2].update({ cards: 'QD' });

    await playerVote(players[0], 0);
    await playerVote(players[1], 0);
    chai
      .request(server)
      .post('/api/player/vote')
      .set('Content-Type', 'application/json')
      .send({ vote: 1, playerId: players[2].getDataValue('id') })
      .end((err, res) => {
        console.log(err);
        expect(res.status).to.be.equal(400);
      });
  });
  */

  it('trump card', async () => {
    const room = await Room.findByPk(id, { include: Player });
    let players = await room.getPlayers();

    await room.update({ atu: 'JD' });
    await players[0].update({ cards: 'TC' });
    await players[1].update({ cards: 'KD' });
    await players[2].update({ cards: 'QD' });

    await playerVote(players[0], 0);
    await playerVote(players[1], 1);
    await playerVote(players[2], 1);

    await playCard(players[0], players[0].getDataValue('cards').split(',')[0]);
    await playCard(players[1], players[1].getDataValue('cards').split(',')[0]);
    await playCard(players[2], players[2].getDataValue('cards').split(',')[0]);

    players = await room.getPlayers();

    expect(players[0].getDataValue('points')).to.be.equal(5);
    expect(players[1].getDataValue('points')).to.be.equal(6);
    expect(players[2].getDataValue('points')).to.be.equal(-1);
  }).timeout(100000);

  it('first player wins without trump card', async () => {
    const room = await Room.findByPk(id, { include: Player });
    let players = await room.getPlayers();

    await room.update({ atu: 'JD' });
    await players[0].update({ cards: 'TC' });
    await players[1].update({ cards: 'KS' });
    await players[2].update({ cards: 'QH' });

    await playerVote(players[1], 0);
    await playerVote(players[2], 0);
    await playerVote(players[0], 0);

    await playCard(players[1], players[1].getDataValue('cards').split(',')[0]);
    await playCard(players[2], players[2].getDataValue('cards').split(',')[0]);
    await playCard(players[0], players[0].getDataValue('cards').split(',')[0]);

    players = await room.getPlayers();

    expect(players[0].getDataValue('points')).to.be.equal(10);
    expect(players[1].getDataValue('points')).to.be.equal(5);
    expect(players[2].getDataValue('points')).to.be.equal(4);
  }).timeout(100000);

  it('last player wins without trump card', async () => {
    const room = await Room.findByPk(id, { include: Player });
    let players = await room.getPlayers();

    await room.update({ atu: 'JD' });
    await players[0].update({ cards: 'TC' });
    await players[1].update({ cards: 'KH' });
    await players[2].update({ cards: 'QH' });

    await playerVote(players[2], 1);
    await playerVote(players[0], 0);
    await playerVote(players[1], 1);

    await playCard(players[2], players[2].getDataValue('cards').split(',')[0]);
    await playCard(players[0], players[0].getDataValue('cards').split(',')[0]);
    await playCard(players[1], players[1].getDataValue('cards').split(',')[0]);

    players = await room.getPlayers();

    expect(players[0].getDataValue('points')).to.be.equal(15);
    expect(players[1].getDataValue('points')).to.be.equal(11);
    expect(players[2].getDataValue('points')).to.be.equal(3);
  }).timeout(100000);

  it('bug in testing', async () => {
    const room = await Room.findByPk(id, { include: Player });
    let players = await room.getPlayers();

    await room.update({ atu: null });
    await players[0].update({ cards: 'TC,AD' });
    await players[1].update({ cards: 'JH,KS' });
    await players[2].update({ cards: 'KD,JS' });

    await playCard(players[0], 'TC');
    await playCard(players[1], 'JH');
    await playCard(players[2], 'KD');

    players = await room.getPlayers();
    expect(players[0].getDataValue('final_score')).to.be.equal(1);
    expect(players[1].getDataValue('final_score')).to.be.equal(0);
    expect(players[2].getDataValue('final_score')).to.be.equal(0);
  }).timeout(100000);

  after(async () => {
    const room = await Room.findByPk(id);
    await room.destroy();
  });
});
