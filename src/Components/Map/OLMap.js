import React, { useEffect, useState, createContext } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import { MapControlMenuButtonProvider } from '../../CustomContext/MapControlMenuButtonContext';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';

export const OLMapContext = createContext(undefined);

const OLMap = ({ children }) => {

  const [map, setMap] = useState();

  useEffect(() => {
    const olMap = new Map({
      controls: [],
      interactions: defaultInteractions({ doubleClickZoom: false }).extend([
        new PointerInteraction({
          handleDoubleClickEvent: (event) => {
            event.preventDefault();
          },
        }),
      ]),
    });
    setMap(olMap);
  }, []);

  return (
    <>
      <MapControlMenuButtonProvider>
        <OLMapContext.Provider value={map}>
          {children}
        </OLMapContext.Provider>
      </MapControlMenuButtonProvider>
    </>
  )
};

export default OLMap;
