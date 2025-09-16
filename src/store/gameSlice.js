import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  score: 0,
  gameStarted: false,
  gameOver: false,
  timer: 60,            // ✅ using timer directly instead of unused duration
  itPlayerChasing: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.gameStarted = true;
      state.gameOver = false;
      state.timer = 60;   // ✅ reset timer
      state.score = 0;    // ✅ reset score
    },
    endGame: (state) => {
      state.gameOver = true;
    },
    resetGame: (state) => {
      state.gameStarted = false;
      state.gameOver = false;
      state.timer = 60;
      state.score = 0;
    },
    incrementScore: (state, action) => {
      state.score += action.payload;
    },
    updateTimer: (state) => {
      if (state.timer > 0) {
        state.timer -= 1;
      } else {
        state.gameOver = true;
      }
    },
    setItPlayerChasing: (state, action) => {
      state.itPlayerChasing = action.payload;
    },
  },
});

export const {
  startGame,
  endGame,
  resetGame,
  incrementScore,
  updateTimer,
  setItPlayerChasing,
} = gameSlice.actions;

export default gameSlice.reducer;
