import React, { createContext, useContext, useState, useEffect } from 'react';

const ColorContext = createContext();

export const useColor = () => {
  return useContext(ColorContext);
};

export const ColorProvider = ({ children }) => {

  const [backgroundColor, setBackgroundColor] = useState(localStorage.getItem('backgroundColor') || '#1E3A8A');
  const [newBackgroundColor, setNewBackgroundColor] = useState(localStorage.getItem('newBackgroundColor') || '#1E3A8A');
  const [textColor, setTextColor] = useState(localStorage.getItem('textColor') || '#ffffff');
  const [newTextColor, setNewTextColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState(localStorage.getItem('borderColor') || '#C7D5FF');
  const [newBorderColor, setNewBorderColor] = useState('#C7D5FF');
  const [typoColor, setTypoColor] = useState(localStorage.getItem('typoColor') || '#000000');
  const [newTypoColor, setNewTypoColor] = useState('#000000');
  const [cardbodyColor, setCardbodyColor] = useState(localStorage.getItem('cardbodyColor') || '#ffffff');
  const [newCardbodyColor, setNewCardbodyColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('fontFamily') || "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue' sans-serif");
  const [newFontFamily, setNewFontFamily] = useState("-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue' sans-serif");
  useEffect(() => {
    // Get the stored color from localStorage when the component mounts
    const storedTextColor = localStorage.getItem('textColor');
    if (storedTextColor) {
      setNewTextColor(storedTextColor);
    }
    const storedBorderColor = localStorage.getItem('borderColor');
    if (storedBorderColor) {
      setNewBorderColor(storedBorderColor);
    }
    const storedTypoColor = localStorage.getItem('typoColor');
    if (storedTypoColor) {
      setNewTypoColor(storedTypoColor);
    }
    const storedCardBodyColor = localStorage.getItem('cardbodyColor');
    if (storedCardBodyColor) {
      setNewCardbodyColor(storedCardBodyColor);
    }
    const storedFontFamily = localStorage.getItem('fontFamily');
    if (storedFontFamily) {
      setNewFontFamily(storedFontFamily);
    }
  }, []); 

  const handleBackgroundColorChange = (newColor) => {
    localStorage.removeItem('backgroundColor');
    setNewBackgroundColor(newColor);
    setBackgroundColor(newColor);
    localStorage.setItem('backgroundColor', newColor);
  };

  const handleTextColorChange = (newColor) => {
    localStorage.removeItem('textColor');
    setNewTextColor(newColor);
    localStorage.setItem('textColor', newColor);
    setTextColor(newColor);
  };

  const handleBorderColorChange = (newColor) => {
    localStorage.removeItem('borderColor');
    setNewBorderColor(newColor);
    setBorderColor(newColor);
    localStorage.setItem('borderColor', newColor);
  };

  const handleTypoColorChange = (newColor) => {
    localStorage.removeItem('typoColor');
    setNewTypoColor(newColor);
    setTypoColor(newColor);
    localStorage.setItem('typoColor', newColor);
  };

  const handlecardbodyColorChange = (newColor) => {
    localStorage.removeItem('cardbodyColor');
    setNewCardbodyColor(newColor);
    setCardbodyColor(newColor);
    localStorage.setItem('cardbodyColor', newColor);
  };

  const handleFontFamilyChange = (family) => {
    localStorage.removeItem('fontFamily');
    setNewFontFamily(family);
    setFontFamily(family);
    localStorage.setItem('fontFamily', family);
  };
 
  return (
    <ColorContext.Provider
      value={{
        backgroundColor,
        newBackgroundColor,
        textColor,
        newTextColor,
        borderColor,
        newBorderColor,
        typoColor,
        newTypoColor,
        cardbodyColor,
        newCardbodyColor,
        fontFamily,
        newFontFamily,
        handleBackgroundColorChange,
        handleTextColorChange,
        handleBorderColorChange,
        handleTypoColorChange,
        handlecardbodyColorChange,
        handleFontFamilyChange,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};
