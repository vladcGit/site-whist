import React from 'react';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import Room from './Room';
import Game from './Game';

export default function App() {
  return (
    <MantineProvider
      theme={{ colorScheme: 'dark' }}
      withGlobalStyles
      withNormalizeCSS
    >
      <NotificationsProvider>
        <>
          <BrowserRouter>
            <Routes>
              <Route exact path='/' element={<Homepage />} />
              <Route exact path='/room/:id' element={<Room />} />
              <Route exact path='/room/:id/game' element={<Game />} />
            </Routes>
          </BrowserRouter>
        </>
      </NotificationsProvider>
    </MantineProvider>
  );
}
