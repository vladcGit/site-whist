import { useState } from 'react';
import { Modal, Button, Group } from '@mantine/core';

export default function ModalClasament({ players }) {
  const [opened, setOpened] = useState(false);
  const playersCopy = [...players];
  playersCopy.sort((a, b) => b.points - a.points);

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title='Standings'>
        <>
          {playersCopy.map((player, index) => (
            <Group position='center' key={player.id}>
              {`${index + 1}. ${player.name} ${player.points || 0}`}
            </Group>
          ))}
        </>
      </Modal>

      <Group
        position='center'
        style={{ position: 'absolute', top: 0, right: 0, margin: '2vh' }}
      >
        <Button onClick={() => setOpened(true)} color={'gray'}>
          Standings
        </Button>
      </Group>
    </>
  );
}
