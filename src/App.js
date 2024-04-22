
      import React, { useEffect, useState } from 'react';
      import 'bootstrap-icons/font/bootstrap-icons.css';
      import OLMap from "./Components/Map/OLMap";
      import { AlertProvider } from './CustomContext/AlertContext';
      import { ColorProvider } from './CustomContext/ColorContext';
      import { SidebarProvider } from './CustomContext/SidebarContext';
      import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
      import Dashboard from './Components/General/Authentication/Dashboard';
      import { CheckedItemsProvider } from './CustomContext/CheckedItemContext';
      import ThemeProvider from './CustomContext/ThemeProvider';
      import { OverLayPanelProvider } from './CustomContext/OverLayContext';
      import projectTitle from './utils/ApplicationTitleConfig';
      import { ToastContainer } from 'react-toastify';
      import 'react-toastify/dist/ReactToastify.css';
      import 'datatables.net-dt/css/dataTables.dataTables.css';
      import 'datatables.net-bs5/css/dataTables.bootstrap5.css';
      import 'datatables.net';
      import { GeoServerContextProvider } from './CustomContext/GeoServerContext';
     
      import AttributeQuery from './Components/Map/ProductFilter/AttributeQuery';
import Home from './Components/Map/Controls/Home';
import ZoomWindow from './Components/Map/Controls/ZoomWindow';
import ZoomIn from './Components/Map/Controls/ZoomIn';
import ZoomOut from './Components/Map/Controls/ZoomOut';
import Map from './Components/Map/View/OLView';
import OverView from './Components/Map/Controls/OverView';
import Measure from './Components/Map/Controls/Measure';
import ProductFilters from './Components/Map/ProductFilter/ProductFilters';
import Scale from './Components/Map/Controls/Scale';
import Cart from './Components/Map/Cart';
import FeatureInfo from './Components/Map/Controls/FeatureInfo';
import MousePosition from './Components/Map/Controls/MousePosition';
import BaseMaps from './Components/Map/Controls/BaseMaps';
import User from './Components/General/Authentication/User';
      const App = () => {
        useEffect(() => {
          document.title = projectTitle?._data?.projectName;
          const faviconPath = projectTitle?._data?.image;   // Replace with the actual path for the default favicon
          const linkElement = document.querySelector("link[rel='icon']") || document.createElement('link');
          linkElement.rel = 'icon';
          linkElement.href = faviconPath;
          document.head.appendChild(linkElement);
        }, []);
       
        const MapComponents = () => {
          return(
            <div>
            <OLMap>
              <AttributeQuery />
<Home />
<ZoomWindow />
<ZoomIn />
<ZoomOut />
<Map />
<OverView />
<Measure />
<ProductFilters />
<Scale />
<Cart />
<FeatureInfo />
<MousePosition />
<BaseMaps />
<User />
              </OLMap>
              </div>
              );
          };
        return (
          <>
          <Router>
          <ColorProvider>
          <ThemeProvider>
          
        <CheckedItemsProvider>
          <SidebarProvider>
          <AlertProvider>
            <GeoServerContextProvider>
            <OverLayPanelProvider>
            <Routes>
          <Route path="/" element={<MapComponents />}/>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        </OverLayPanelProvider>
        </GeoServerContextProvider>
          </AlertProvider>
          </SidebarProvider>
        </CheckedItemsProvider>
      
        </ThemeProvider>
        </ColorProvider>
          </Router>
          <ToastContainer/>
        </>
      );
      }
      export default App;
    