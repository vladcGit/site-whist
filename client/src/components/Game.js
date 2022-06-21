import React, { useState, useEffect } from 'react';
import { createStyles, Divider, Text } from '@mantine/core';

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Players from './Players';

const BREAKPOINT = '@media (max-width: 755px)';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    minHeight: '100vh',
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },

  inner: {
    position: 'relative',
    width: '100vw',
    maxWidth: '100vw',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 120,

    [BREAKPOINT]: {
      paddingBottom: 80,
      paddingTop: 10,
    },
  },
  image: {
    maxWidth: '100%',
    maxHeight: '15vh',
    cursor: 'pointer',
    margin: 10,
  },

  divider: {
    width: '80%',
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    margin: '50px',
    fontSize: 60,
    fontWeight: 900,
    lineHeight: 1.1,
    padding: 0,
    color: theme.white,

    [BREAKPOINT]: {
      fontSize: 42,
      lineHeight: 1.2,
    },
  },

  subtitle: {
    margin: theme.spacing.xl,
    fontSize: 45,
    color: theme.white,

    [BREAKPOINT]: {
      fontSize: 25,
    },
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
  const [playerToPlay, setPlayerToPlay] = useState(null);

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
    return () => socket.disconnect();
  }, [socket, id]);

  //get user
  useEffect(() => {
    if (room) {
      const { name } = JSON.parse(localStorage.getItem('data'));
      const _user = room.Players.filter((player) => player.name === name)[0];
      setUser(_user);

      // numar maxim carti player

      const maxCards =
        room.Players.map((a) => a.cards.length).reduce((a, b) => {
          return Math.max(a, b);
        }, -Infinity) / 2;

      // salveaza primul jucator care are numarul maxim de carti
      // e jucatorul al carui turn este

      const copiePlayers = [...room.Players];
      copiePlayers.sort((a, b) => a.index_order - b.index_order);
      setPlayerToPlay(
        copiePlayers.filter((p) => p.cards?.length / 2 === maxCards)[0]
      );
    }
  }, [room, user]);

  const playCard = async (card) => {
    //todo daca nu au votat toti nu poti juca o carte
    //todo sa poti juca cartea care trebuie (nu romb daca ai atu si atu e spade)
    //todo sa inceapa jucatorul care a castigat tura trecuta
    if (playerToPlay.id !== user.id) return;
    await axios.post(
      `/api/player/play/${user.id}`,
      { card },
      { headers: { 'Content-Type': 'application/json' } }
    );
    sendUpdate();
  };

  return (
    <>
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
            <Text className={classes.description}>Trump card:</Text>
            <img
              alt={room.atu}
              src={`/svg/${room.atu}.svg`}
              className={classes.image}
            />
            <Divider my='xl' className={classes.divider} />
            <Players
              room={room}
              user={user}
              callback={sendUpdate}
              userWithTurn={playerToPlay.id}
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
              {user.cards
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
