import React, { createContext, useContext, useState } from 'react';

const CheckedItemsContext = createContext();

export function CheckedItemsProvider({ children }) {
  
  const [checkedItems, setCheckedItems] = useState([]);

  const toggleCheckedItem = (itemId) => {

    setCheckedItems((prevItems) => {
      if (prevItems.includes(itemId)) {
        return prevItems.filter((checkedItem) => checkedItem !== itemId);
      } else {
        return [...prevItems, itemId];
      }
    });

  };

  const removeItem = (itemToRemove) => {
    setCheckedItems((prevItems) => prevItems.filter((item) => item !== itemToRemove));
  };

  return (
    <CheckedItemsContext.Provider value={{ checkedItems, toggleCheckedItem, removeItem ,setCheckedItems}}>
      {children}
    </CheckedItemsContext.Provider>
  );
}

export function useCheckedItems() {
  return useContext(CheckedItemsContext);
}
