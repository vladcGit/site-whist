import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import { io } from 'socket.io-client';
import {
  Button,
  Checkbox,
  Grid,
  Container,
  Text,
  createStyles,
  Group,
  Card,
  useMantineTheme,
  RadioGroup,
  Radio,
  Divider,
} from '@mantine/core';
const BREAKPOINT = '@media (max-width: 755px)';

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    minHeight: '100vh',
  },

  inner: {
    position: 'relative',
    textAlign: 'center',
    paddingTop: 100,
    paddingBottom: 120,

    [BREAKPOINT]: {
      paddingBottom: 80,
      paddingTop: 80,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontSize: 50,
    fontWeight: 900,
    lineHeight: 1.1,
    margin: 0,
    padding: 0,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    marginBottom: '30px',

    [BREAKPOINT]: {
      fontSize: 42,
      lineHeight: 1.2,
    },
  },

  description: {
    marginTop: theme.spacing.xl,
    marginBottom: '30px',
    fontSize: 24,

    [BREAKPOINT]: {
      fontSize: 18,
    },
  },
}));

export default function Room() {
  const navigate = useNavigate();

  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [checked, setChecked] = useState(true);
  const [gameType, setGameType] = useState('1-8-1');

  const { classes } = useStyles();
  const theme = useMantineTheme();

  const secondaryColor =
    theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7];

  const handleStartGame = async () => {
    await axios.put(`/api/room/${id}`, {
      type: gameType,
      card_on_forehead: checked,
    });

    await axios.get(`/api/room/${id}/start`);
    navigate(`/room/${id}/game`);
  };

  useEffect(() => {
    const socket = io('/', {
      query: { id },
    });
    socket.emit('update', JSON.stringify({ id }));
    socket.on('room', (message) => {
      const data = JSON.parse(message);
      console.log(data);
      setRoom(data);
      if (data?.is_started) navigate(`/room/${id}/game`);
    });
    return () => socket.disconnect();
  }, [id, navigate]);

  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
        <h1 className={classes.title}>
          Share the code with your friends and when you are ready press start
        </h1>
        <h1 className={classes.description}>The code is: {id}</h1>
        {room?.Players[0]?.name ===
          JSON.parse(localStorage.getItem('data')).name && (
          <>
            <Button variant='filled' size='lg' onClick={handleStartGame}>
              Start
            </Button>
            <Divider my='xl' />
            <Checkbox
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
              size='xl'
              label='Play with your card unseen on games of one'
            />
            <Divider my='xl' />
            <RadioGroup
              value={gameType}
              onChange={setGameType}
              label='Select game type'
              size='xl'
            >
              <Radio value='1-8-1' label='1-8-1' />
              <Radio value='8-1-8' label='8-1-8' />
            </RadioGroup>
          </>
        )}
      </Container>
      <Container my='md'>
        <Grid>
          {room &&
            room.Players.map((player) => (
              <Grid.Col xs={4} key={player.id}>
                <Card shadow='sm' p='xl'>
                  <Group position='center'>
                    <Text weight={500} size='xl'>
                      {player.name}
                    </Text>
                  </Group>
                  <Group position='center'>
                    <Text
                      mt='10px'
                      size='xl'
                      style={{ color: secondaryColor, lineHeight: 1.5 }}
                    >
                      {player.index_order}
                    </Text>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
        </Grid>
      </Container>
    </div>
  );
}
