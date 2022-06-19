import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { createStyles, Container, Text, Button, Input } from '@mantine/core';
import updateGradient from './gradient';
import { hexToRgb } from '../util';
import { showNotification } from '@mantine/notifications';

const BREAKPOINT = '@media (max-width: 755px)';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: `rgba(${hexToRgb(theme.colors.dark[8]).join(',')},0.5)`,
    // backgroundColor:
    //   theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },

  inner: {
    position: 'relative',
    paddingTop: 100,
    paddingBottom: 120,

    [BREAKPOINT]: {
      paddingBottom: 80,
      paddingTop: 80,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: 62,
    fontWeight: 900,
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,

    [BREAKPOINT]: {
      fontSize: 42,
      lineHeight: 1.2,
    },
  },

  description: {
    marginTop: theme.spacing.xl,
    fontSize: 24,

    [BREAKPOINT]: {
      fontSize: 18,
    },
  },

  controls: {
    marginTop: theme.spacing.xl * 2,

    [BREAKPOINT]: {
      marginTop: theme.spacing.xl,
    },
  },

  control: {
    height: 54,
    paddingLeft: 38,
    paddingRight: 38,

    [BREAKPOINT]: {
      height: 54,
      paddingLeft: 18,
      paddingRight: 18,
      flex: 1,
    },
  },
}));

export default function Homepage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { classes } = useStyles();

  React.useEffect(() => {
    const timer = setInterval(updateGradient, 10);
    return () => clearInterval(timer);
  }, []);

  const handleCreateRoom = async () => {
    if (name.length < 3)
      return showNotification({
        title: 'Error',
        message: 'The name must have at least 3 letters',
        color: 'red',
      });
    const resRoom = await axios.post(`/api/room/new`);
    const { id } = resRoom.data;
    await axios.post(
      `/api/room/${id}/player/new`,
      { name },
      { headers: { 'Content-Type': 'application/json' } }
    );
    localStorage.setItem('data', JSON.stringify({ id, name }));
    navigate(`/room/${id}`);
  };

  const handleJoinRoom = async () => {
    await axios.post(
      `/api/room/${code}/player/new`,
      { name },
      { headers: { 'Content-Type': 'application/json' } }
    );
    localStorage.setItem('data', JSON.stringify({ code, name }));
    navigate(`/room/${code}`);
  };

  return (
    <div id='gradient'>
      <div className={classes.wrapper}>
        <Container size={700} className={classes.inner}>
          <h1 className={classes.title}>
            Play{' '}
            <Text
              component='span'
              variant='gradient'
              gradient={{ from: 'blue', to: 'cyan' }}
              inherit
            >
              Whist
            </Text>{' '}
            with your friends for free
          </h1>

          <Text className={classes.description} mt='60px' mb='30px'>
            First enter your name:
          </Text>
          <Input
            placeholder='your name...'
            mb='60px'
            size='lg'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Text className={classes.description} mb='30px' mt='30px'>
            then create a new game...
          </Text>
          <Button
            variant='filled'
            className={classes.control}
            onClick={handleCreateRoom}
            size='xl'
          >
            Create
          </Button>
          <Text className={classes.description} mb='30px' mt='40px'>
            ...or join an existing game
          </Text>
          <Input
            placeholder='code...'
            type='number'
            mb='30px'
            size='lg'
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            variant='filled'
            size='xl'
            className={classes.control}
            onClick={handleJoinRoom}
          >
            Join
          </Button>
        </Container>
      </div>
    </div>
  );
}
