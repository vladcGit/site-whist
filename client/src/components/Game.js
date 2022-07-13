import React, { useState, useEffect } from 'react';
import { createStyles, Divider, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Players from './Players';
import ModalClasament from './ModalClasament';
import { getMaxNumberOfCards } from '../util';

const BREAKPOINT = '@media (max-width: 755px)';

const useStyles = createStyles((theme) => ({
  image: {
    maxWidth: '100%',
    maxHeight: '15vh',
    cursor: 'pointer',
    margin: 10,
  },

  divider: {
    width: '80%',
  },

  description: {
    margin: theme.spacing.lg,
    fontSize: 35,
    color: theme.white,

    [BREAKPOINT]: {
      fontSize: 18,
    },
  },
}));

export default function Game() {
  const { id } = useParams();

  const [socket, setsocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [playerOrder, setPlayerOrder] = useState([]);

  const { classes } = useStyles();

  useEffect(() => {
    const fetchRoom = async () => {
      const res = await axios.get(`/api/room/${id}`);
      setRoom(res.data);
    };
    fetchRoom();

    const newSocket = io('/', {
      query: { id },
    });
    setsocket(newSocket);
    return () => newSocket.disconnect();
  }, [id]);

  //websocket

  const sendUpdate = () => {
    socket.emit('update', JSON.stringify({ id }));
  };

  useEffect(() => {
    if (!socket) return;
    socket.emit('update', JSON.stringify({ id }));
    socket.on('room', (message) => {
      const data = JSON.parse(message);
      console.log(data);
      setRoom(data);
      console.log(data);
    });
    socket.on('notification', (message) => {
      showNotification({ message, autoClose: false });
    });
    return () => socket.disconnect();
  }, [socket, id]);

  //get user
  useEffect(() => {
    if (!room) return;
    const { name } = JSON.parse(localStorage.getItem('data'));
    const _user = room.Players.filter((player) => player.name === name)[0];
    setUser(_user);

    //calculeaza ordine jucatori
    const turns = [];
    let firstPlayerIndex;
    if (room.first_player_index) {
      const firstPlayer = room.Players.filter(
        (p) => p.index_order === room.first_player_index
      )[0];
      firstPlayerIndex = room.Players.indexOf(firstPlayer);
    } else {
      firstPlayerIndex = (room.round - 1) % room.Players.length;
    }
    for (let i = firstPlayerIndex; i < room.Players.length; i++) {
      turns.push(room.Players[i]);
    }

    for (let i = 0; i < firstPlayerIndex; i++) {
      turns.push(room.Players[i]);
    }

    setPlayerOrder(turns);
    console.log(turns);
  }, [room, user]);

  const getCurrentPlayer = () => {
    // daca cineva nu a votat atunci e randul lui
    const firstPlayerWithoutVote = playerOrder.filter(
      (p) => p.initial_score == null
    )[0];
    if (firstPlayerWithoutVote) return firstPlayerWithoutVote;

    // daca toti jucatorii au acelasi numar de carti, atunci se alege primul jucator
    const firstPlayer = playerOrder[0];
    const playerWithSameCards = room.Players.filter(
      (p) => p.cards.length === firstPlayer.cards.length
    ).length;
    if (playerWithSameCards === room.Players.length) return firstPlayer;

    // jucatorul cu cele mai putine carti
    for (let i = 0; i < room.Players.length - 1; i++) {
      if (playerOrder[i].cards.length < playerOrder[i + 1].cards.length)
        return playerOrder[i + 1];
    }
    return firstPlayer;
  };

  const playCard = async (card) => {
    if (getCurrentPlayer().id !== user.id)
      return showNotification({
        message: 'It is not your turn',
        color: 'red',
      });
    if (room?.Players.filter((p) => p.initial_score == null).length > 0)
      return showNotification({
        message: 'Wait for all the players to finish voting',
        color: 'red',
      });
    // daca ai carte de acelasi suite
    if (room.cards && card[1] !== room.cards[1]) {
      const suiteCards = user.cards
        .split(',')
        .filter((c) => c[1] === room.cards[1]);
      if (suiteCards.length > 0)
        return showNotification({
          message: 'You must play a card the same suit as the first card',
          color: 'red',
        });
    }

    // daca nu ai carte de acelasi suit dar ai atu

    if (room.cards && card[1] !== room.cards[1]) {
      const atuCards = user.cards
        .split(',')
        .filter((c) => c[1] === room.atu[1]);
      if (atuCards.length > 0 && card[1] !== room.atu[1])
        return showNotification({
          message: 'You must play a card the same suit as the trump card',
          color: 'red',
        });
    }
    await axios.post(
      `/api/player/play/${user.id}`,
      { card },
      { headers: { 'Content-Type': 'application/json' } }
    );
    sendUpdate();
  };

  return (
    <>
      {room && <ModalClasament players={room.Players} />}
      {user && room && !room.is_finished && (
        <div style={{ minHeight: '100vh' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
              alignItems: 'center',
            }}
          >
            {getMaxNumberOfCards(room) !== 8 ? (
              <>
                <Text className={classes.description}>Trump card:</Text>
                <img
                  alt={room.atu}
                  src={`/svg/${room.atu}.svg`}
                  className={classes.image}
                />
                <Divider my='xl' className={classes.divider} />
              </>
            ) : (
              <div style={{ height: '10vh' }} />
            )}
            <Players
              room={room}
              user={user}
              callback={sendUpdate}
              userWithTurn={getCurrentPlayer()}
              voteOrder={playerOrder}
            />
            <Divider my='xl' className={classes.divider} />
            <Text size='md'>Community cards</Text>
            <div>
              {room.cards?.split(',').map((card) => (
                <img
                  alt={card}
                  key={card}
                  src={`/svg/${card}.svg`}
                  className={classes.image}
                />
              ))}
            </div>
            <Divider my='xl' className={classes.divider} />
          </div>
          <div
            style={{
              flexGrow: 1,
              width: '100vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div>
              {(room.card_on_forehead === false ||
                getMaxNumberOfCards(room) !== 1 ||
                room.Players.filter((p) => p.initial_score === null).length ===
                  0) &&
                user.cards
                  .split(',')
                  .sort((a, b) => {
                    if (a[1] !== b[1]) return a.charCodeAt(1) - b.charCodeAt(1);
                    if (a[0] === 'A') return -1;
                    if (b[0] === 'A') return 1;
                    return a.charCodeAt(0) - b.charCodeAt(0);
                  })
                  .filter((c) => c.length > 0)
                  .map((card) => (
                    <img
                      key={card}
                      alt={card}
                      src={`/svg/${card}.svg`}
                      className={classes.image}
                      onClick={() => playCard(card)}
                    />
                  ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
