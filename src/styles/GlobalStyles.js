import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'); /* Example retro font */

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Press Start 2P', cursive; /* Apply retro font or a clear sans-serif */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #282c34; /* Dark background */
    color: #ffffff;
    overflow: hidden; /* Prevent scrolling */
  }

  #root {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
`;

export default GlobalStyles;