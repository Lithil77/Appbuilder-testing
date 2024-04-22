import React, { useState, useContext } from 'react';

// Create a context to hold the state and setter
const MapControlMenuButtonContext = React.createContext();

// Custom hook to consume the context
export const useMapControlMenuButton = () => {
  return useContext(MapControlMenuButtonContext);
}

// Example provider to wrap your application
export function MapControlMenuButtonProvider({ children }) {
  const exampleState = useState(false); // Initialize the state here
  return (
    <MapControlMenuButtonContext.Provider value={exampleState}>
      {children}
    </MapControlMenuButtonContext.Provider>
  );
}
