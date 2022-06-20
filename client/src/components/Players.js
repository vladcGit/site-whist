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

export default function Players({ room, user, callback }) {
  const theme = useMantineTheme();

  const [vote, setVote] = useState(user.initial_score);

  const prevPlayer = room?.Players?.filter(
    (p) => p.index_order === user.index_order - 1
  )[0];
  const prevPlayerVoted = prevPlayer ? prevPlayer.initial_score != null : true;

  const nextPlayer = room?.Players?.filter(
    (p) => p.index_order === user.index_order + 1
  )[0];

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
        {room?.Players?.filter((p) => p.id !== user.id).map((player) => {
          return (
            <Grid.Col xs={4} key={player.id}>
              <Card shadow='sm' p='xl'>
                <Group position='center' direction='column'>
                  <Text size='md'>{player.name}</Text>
                  {player.initial_score != null && (
                    <Text size='sm'>{`Bidded ${player.initial_score}`}</Text>
                  )}
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
        {/* Fiecare jucator voteaza cate maini face */}
        {user.initial_score == null &&
          prevPlayerVoted &&
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
