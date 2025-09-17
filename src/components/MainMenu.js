import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// ✅ Import background image
import bgImg from "../assets/images/philippine_village_background.png";

// 🌌 Background animation (parallax float)
const floatBG = keyframes`
  0% { background-position: center top; }
  50% { background-position: center bottom; }
  100% { background-position: center top; }
`;

// ✨ Popup animation
const popup = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-image: url(${bgImg});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  animation: ${floatBG} 15s ease-in-out infinite;
  position: relative;
  overflow: hidden;
`;

// 🌑 Overlay for contrast
const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
`;

// 🎉 Floating particles
const Particle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #ffcc00;
  border-radius: 50%;
  top: ${(props) => props.top}%;
  left: ${(props) => props.left}%;
  opacity: 0.8;
  animation: floatUp 6s linear infinite;

  @keyframes floatUp {
    from { transform: translateY(0); opacity: 0.8; }
    to { transform: translateY(-100vh); opacity: 0; }
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 2rem;
  color: #ffeb3b;
  text-shadow: 
    4px 4px 0px #ff4500,
    6px 6px 12px rgba(0, 0, 0, 0.7);
  z-index: 2;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-12px); }
  }
`;

const MenuButton = styled.button`
  background: linear-gradient(145deg, #ffcc00, #ff6600);
  border: 3px solid #fff;
  border-radius: 50px;
  padding: 15px 60px;
  margin: 12px 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0px 8px 0px #b33c00, 0px 14px 25px rgba(0, 0, 0, 0.6);
  z-index: 2;
  animation: pulse 2.5s infinite;

  &:hover {
    background: linear-gradient(145deg, #ff9933, #ff3300);
    transform: scale(1.1) translateY(-4px);
    box-shadow: 0px 10px 0px #802200, 0px 18px 30px rgba(0, 0, 0, 0.8);
  }

  &:active {
    transform: scale(0.95) translateY(2px);
    box-shadow: 0px 4px 0px #802200;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

// 🎮 Special Start Button (pop-up glowing)
const StartButton = styled(MenuButton)`
  font-size: 2rem;
  padding: 20px 80px;
  background: linear-gradient(145deg, #ffdf00, #ff6600);
  border: 4px solid #fff;
  animation: ${popup} 0.8s ease forwards, pulseGlow 2s infinite;

  @keyframes pulseGlow {
    0% { box-shadow: 0px 10px 0px #b33c00, 0px 20px 35px rgba(255, 200, 0, 0.6); }
    50% { box-shadow: 0px 14px 0px #802200, 0px 28px 50px rgba(255, 140, 0, 0.9); }
    100% { box-shadow: 0px 10px 0px #b33c00, 0px 20px 35px rgba(255, 200, 0, 0.6); }
  }

  &:hover {
    transform: scale(1.2) translateY(-8px);
    background: linear-gradient(145deg, #ffb300, #ff3300);
  }

  &:active {
    transform: scale(0.95) translateY(4px);
  }
`;

const MainMenu = () => {
  const navigate = useNavigate();

  // Generate random floating particles
  const particles = Array.from({ length: 15 }, (_, i) => (
    <Particle key={i} top={Math.random() * 100} left={Math.random() * 100} />
  ));

  return (
    <MenuContainer>
      <Overlay />
      {particles}
      <Title>Battle Lata</Title>
      <StartButton onClick={() => navigate("/game")}>▶ Start Game</StartButton>
      <MenuButton onClick={() => navigate("/how-to-play")}>How to Play</MenuButton>
      <MenuButton onClick={() => navigate("/settings")}>Settings</MenuButton>
    </MenuContainer>
  );
};

export default MainMenu;