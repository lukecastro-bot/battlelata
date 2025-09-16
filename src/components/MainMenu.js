import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ✅ Import background image
import bgImg from '../assets/images/philippine_village_background.png';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url(${bgImg});
  background-size: cover;
  background-position: center;
  color: white;
`;

const MainMenu = () => {
  const navigate = useNavigate();
  return (
    <MenuContainer>
      <h1>Tumbang Preso!</h1>
      <button onClick={() => navigate('/game')}>Start Game</button>
    </MenuContainer>
  );
};

export default MainMenu;
