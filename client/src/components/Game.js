import React, { useState, useEffect } from 'react';
import { Container, createStyles, Divider } from '@mantine/core';

import axios from 'axios';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

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
    paddingTop: 50,
    paddingBottom: 120,

    [BREAKPOINT]: {
      paddingBottom: 80,
      paddingTop: 50,
    },
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
      console.log(_user.cards);
    }
  }, [room, user]);

  return (
    <div className={classes.wrapper}>
      {user && room && !room.is_finished && (
        <Container className={classes.inner}>
          <img
            alt={room.atu}
            src={`/svg/${room.atu}.svg`}
            style={{
              maxWidth: '100%',
              maxHeight: '20vh',
            }}
          />
          <Divider my='xl' />

          {user.cards
            .split(',')
            .sort((a, b) => {
              if (a[1] !== b[1]) return a.charCodeAt(1) - b.charCodeAt(1);
              if (a[0] === 'A') return -1;
              if (b[0] === 'A') return 1;
              return a.charCodeAt(0) - b.charCodeAt(0);
            })
            .map((card) => (
              <img
                key={card}
                alt={card}
                src={`/svg/${card}.svg`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '20vh',
                }}
              />
            ))}
          <Divider my='xl' />
        </Container>
      )}
    </div>
  );
}
