import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useColor } from '../CustomContext/ColorContext';

const ThemeProvider = ({ children }) => {
  const {
    backgroundColor,
    textColor,
    borderColor,
    typoColor,
    cardbodyColor,
    fontFamily
    // Add other color properties as needed
  } = useColor();

  const theme = {
    backgroundColor,
    textColor,
    borderColor,
    typoColor,
    cardbodyColor,
    fontFamily,
    // Add other color properties as needed
  };

  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};

export default ThemeProvider;
