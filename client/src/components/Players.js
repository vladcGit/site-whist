import {
  Container,
  Grid,
  Group,
  Text,
  Card,
  useMantineTheme,
  Button,
} from '@mantine/core';
import axios from 'axios';
import React, { useState } from 'react';
import { getMaxNumberOfCards } from '../util';

export default function Players({
  room,
  user,
  callback,
  userWithTurn,
  voteOrder,
}) {
  const theme = useMantineTheme();

  const [vote, setVote] = useState(user.initial_score);

  const indexOfPlayer = voteOrder.indexOf(user);
  const nextPlayer = room?.Players[indexOfPlayer + 1];

  const submitNumberOfCards = async () => {
    await axios.post(
      '/api/player/vote',
      { vote, playerId: user.id },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    callback();
  };

  return (
    <Container style={{ width: '90vw' }}>
      <Grid size='xl'>
        {room?.Players?.map((player) => {
          return (
            <Grid.Col xs={4} key={player.id}>
              <Card
                shadow='sm'
                p='xl'
                sx={{
                  backgroundColor:
                    player.id === userWithTurn.id ? theme.colors.green[8] : '',
                }}
              >
                <Group position='center' direction='column'>
                  <Text size='md'>{player.name}</Text>
                  {player.initial_score != null && (
                    <Text size='sm'>{`Bidded ${player.initial_score}`}</Text>
                  )}
                  {player.initial_score != null && (
                    <Text size='sm'>{`Made ${player.final_score || 0}`}</Text>
                  )}
                  {room.card_on_forehead === true &&
                    getMaxNumberOfCards(room) === 1 &&
                    player !== user &&
                    room.Players.filter((p) => p.initial_score === null)
                      .length !== 0 && (
                      <img
                        alt={player.cards}
                        src={`/svg/${player.cards}.svg`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '15vh',
                          margin: 10,
                        }}
                      />
                    )}
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
        {/* Fiecare jucator voteaza cate maini face */}
        {user.initial_score == null &&
          user.id === userWithTurn.id &&
          room?.Players.length > 0 && (
            <Grid.Col xs={12}>
              <Card shadow='sm' p='xl' mt='xl'>
                <Group position='center' direction='column'>
                  <Text size='md'>
                    Please vote how many hands you think you will win
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      width: '100%',
                      flexWrap: 'wrap',
                    }}
                  >
                    {[...user.cards.split(','), 'idk'].map((_, index) => {
                      const sum = room.Players.map(
                        (p) => p.initial_score
                      ).reduce((partialSum, a) => partialSum + a, 0);
                      console.log(sum);
                      if (
                        !nextPlayer &&
                        sum + index === user.cards.split(',').length
                      )
                        return null;

                      return (
                        <Card
                          shadow={'sm'}
                          key={'vote' + index}
                          p='xl'
                          withBorder
                          sx={{
                            cursor: 'pointer',
                            backgroundColor:
                              vote === index
                                ? theme.colors.green[8]
                                : theme.colors.dark[7],
                          }}
                          onClick={() => setVote(index)}
                        >
                          <Text size='md'>{index}</Text>
                        </Card>
                      );
                    })}
                  </div>
                  {!user.initial_score && (
                    <Button
                      disabled={vote == null}
                      sx={{ backgroundColor: theme.colors.green[8] }}
                      onClick={submitNumberOfCards}
                    >
                      Submit
                    </Button>
                  )}
                </Group>
              </Card>
            </Grid.Col>
          )}
      </Grid>
    </Container>
  );
}
