import React, { createContext, useState } from 'react';

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [sideBarVisible, setSideBarVisible] = useState(false);
    const [sideBarLayersVisible, setSideBarLayersVisible] = useState(false);
    const [bottombarVisible, setBottomBarVisible] = useState(false);
    const [sideBarFeatureInfoVisible, setSideBarFeatureInfoVisible] = useState(false);

    const toggleSidebar = (isValue) => {
        setSideBarVisible(isValue);
        const productFiltersActive = document.getElementById('ProductFilters');
        if (isValue === false) {
            if (productFiltersActive !== null) {
                productFiltersActive.classList.remove('active');
            }
        } else {
            if (productFiltersActive !== null) {
                productFiltersActive.classList.add('active');
            }
        }
    };

    const toggleLayersSidebar = (isValue) => {
        setSideBarLayersVisible(isValue);
        /*  const productFiltersActive = document.getElementById('ProductFilters');
         if (isValue === false) {  
             if(productFiltersActive !== null){       
                 productFiltersActive.classList.remove('active');
             }
         }else{
             if(productFiltersActive !== null){
                 productFiltersActive.classList.add('active');
             }
         } */
    };

    const toggleFeatureInfoSidebar = (isValue) => {
        setSideBarFeatureInfoVisible(isValue);
    }

    const toggleBottombar = (isValue) => {
        setBottomBarVisible(isValue);
    };

    return (
        <SidebarContext.Provider value={{
            sideBarVisible, toggleSidebar, bottombarVisible,
            toggleBottombar, toggleLayersSidebar, sideBarLayersVisible, toggleFeatureInfoSidebar, sideBarFeatureInfoVisible
        }}>
            {children}
        </SidebarContext.Provider>
    );
};
