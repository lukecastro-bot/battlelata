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

const Scoreboard = ({ score }) => {
  return (
    <ScoreboardContainer>
      Score: {score}
    </ScoreboardContainer>
  );
};

export default Scoreboard;