import React, { useRef, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { incrementScore, startGame, updateTimer } from '../store/gameSlice';
import useGamePhysics from '../hooks/useGamePhysics';
import Scoreboard from './Scoreboard';

// ✅ Import images
import itPlayerImg from '../assets/images/it_player.png';
import bgImg from '../assets/images/philippine_village_background.png';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
`;

const GameCanvasStyled = styled.canvas`
  border: 2px solid #fff;
  background-color: rgba(0, 0, 0, 0.3);
  width: 800px;
  height: 600px;
  max-width: 90%;
  max-height: 80%;
  aspect-ratio: 4/3;
`;

const ItPlayerSprite = styled.img`
  position: absolute;
  width: 70px;
  height: 100px;
  object-fit: contain;
  pointer-events: none;
  z-index: 50;
`;

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const { score, gameStarted, gameOver } = useSelector((state) => state.game);

  const [itPlayerPosition, setItPlayerPosition] = useState({ x: 600, y: 500 });

  const { resetSlipper, resetCan } = useGamePhysics(canvasRef, () => {
    dispatch(incrementScore(10));
    setTimeout(() => {
      resetCan();
      resetSlipper();
    }, 500);
  });

  useEffect(() => {
    let timerInterval;
    if (gameStarted && !gameOver) {
      timerInterval = setInterval(() => {
        dispatch(updateTimer());
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [gameStarted, gameOver, dispatch]);

  const handleStartGame = useCallback(() => {
    dispatch(startGame());
    resetCan();
    resetSlipper();
    setItPlayerPosition({ x: 600, y: 500 });
  }, [dispatch, resetCan, resetSlipper]); // ✅ added deps

  return (
    <GameContainer>
      <Scoreboard score={score} />
      <GameCanvasStyled ref={canvasRef} />
      {!gameStarted && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {gameStarted && !gameOver && (
        <ItPlayerSprite
          src={itPlayerImg}
          style={{
            left: `${itPlayerPosition.x}px`,
            top: `${itPlayerPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </GameContainer>
  );
};

export default GameCanvas;
