import React, { useRef, useEffect, useCallback, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementScore,
  startGame,
  updateTimer,
  setLevel,
  setCansTotal,
  resetCansDown,
  incrementCansDown,
} from "../store/gameSlice";
import useGamePhysics from "../hooks/useGamePhysics";
import Scoreboard from "./Scoreboard";

// ✅ Import images
import itPlayerImg from "../assets/images/it_player.png";
import bgImg from "../assets/images/philippine_village_background.png";

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
  border: 4px solid #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(30, 30, 30, 0.7));
  width: 900px;
  height: 650px;
  max-width: 92%;
  max-height: 78%;
  aspect-ratio: 4/3;
  border-radius: 20px;
  box-shadow: 0px 8px 25px rgba(0, 0, 0, 0.7),
    inset 0px 0px 20px rgba(255, 255, 255, 0.15);
  margin-bottom: 20px;
`;

const ItPlayerSprite = styled.img`
  position: absolute;
  width: 80px;
  height: 110px;
  object-fit: contain;
  pointer-events: none;
  z-index: 50;
`;

const ModalOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: #222;
  padding: 40px 60px;
  border-radius: 20px;
  text-align: center;
  color: #fff;
  font-family: "Press Start 2P", cursive; /* 🎮 Arcade font */
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.7);
  animation: popIn 0.6s ease forwards;

  @keyframes popIn {
    0% {
      transform: scale(0.6);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  h1, h2 {
    margin-bottom: 20px;
    text-shadow: 2px 2px 6px rgba(255, 255, 255, 0.2);
  }
`;

const StyledButton = styled.button`
  background: linear-gradient(145deg, #ffcc00, #ff6600);
  color: #fff;
  font-size: 1.4rem;
  font-weight: bold;
  padding: 14px 36px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.25s ease;
  box-shadow: 0px 6px 0px #b33c00, 0px 14px 28px rgba(0, 0, 0, 0.5);
  animation: pulseGlow 2s infinite;

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0px 6px 0px #b33c00,
        0px 16px 32px rgba(255, 200, 0, 0.6);
    }
    50% {
      box-shadow: 0px 10px 0px #802200,
        0px 22px 44px rgba(255, 150, 0, 0.9);
    }
  }

  &:hover {
    background: linear-gradient(145deg, #ff9933, #ff3300);
    transform: scale(1.1) translateY(-4px);
  }

  &:active {
    transform: scale(0.95) translateY(2px);
  }
`;

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();
  const { score, gameStarted, gameOver, level, cansTotal, cansDown } =
    useSelector((state) => state.game);

  const [itPlayerPosition, setItPlayerPosition] = useState({ x: 600, y: 500 });
  const [showModal, setShowModal] = useState(true);

  const { resetSlipper, setupLevel } = useGamePhysics(canvasRef, {
    onScore: (points) => dispatch(incrementScore(points)),
    onCanDown: () => dispatch(incrementCansDown()),
    onLevelCleared: () => {
      const nextLevel = level + 1;
      const nextTotal = cansTotal + 2;
      dispatch(setLevel(nextLevel));
      dispatch(setCansTotal(nextTotal));
      dispatch(resetCansDown());
      setupLevel(nextTotal);
      resetSlipper();
    },
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
    setShowModal(false);
    dispatch(startGame());
    dispatch(setLevel(1));
    dispatch(setCansTotal(5));
    dispatch(resetCansDown());
    setupLevel(5);
    resetSlipper();
    setItPlayerPosition({ x: 600, y: 500 });
  }, [dispatch, setupLevel, resetSlipper]);

  return (
    <GameContainer>
      <Scoreboard
        score={score}
        level={level}
        cansDown={cansDown}
        cansTotal={cansTotal}
      />
      <GameCanvasStyled ref={canvasRef} />

      {gameStarted && !gameOver && (
        <ItPlayerSprite
          src={itPlayerImg}
          style={{
            left: `${itPlayerPosition.x}px`,
            top: `${itPlayerPosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* Start Modal */}
      {showModal && !gameStarted && (
        <ModalOverlay>
          <ModalContent>
            <h1>Battle Lata</h1>
            <p>Knock down the cans and avoid being caught!</p>
            <StyledButton onClick={handleStartGame}> Start Game</StyledButton>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <ModalOverlay>
          <ModalContent>
            <h2>Game Over</h2>
            <p>Your Score: {score}</p>
            <StyledButton onClick={handleStartGame}>Restart</StyledButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </GameContainer>
  );
};

export default GameCanvas;
