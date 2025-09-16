import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu'; // If you're using a separate MainMenu

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} /> {/* Or directly GameCanvas if no separate menu */}
      <Route path="/game" element={<GameCanvas />} />
      {/* Add routes for instructions, multiplayer lobby etc. */}
    </Routes>
  );
};

export default App;