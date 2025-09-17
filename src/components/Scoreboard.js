import React from 'react';
import styled from 'styled-components';

const ScoreboardContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1.5em;
  font-weight: bold;
  color: #FFD700; /* Gold color for score */
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
`;

const Scoreboard = ({ score, level, cansDown, cansTotal }) => {
  return (
    <ScoreboardContainer>
      <Row>
        <span>Score: {score}</span>
        <span>Level: {level}</span>
        <span>Cans: {cansDown}/{cansTotal}</span>
      </Row>
    </ScoreboardContainer>
  );
};

export default Scoreboard;