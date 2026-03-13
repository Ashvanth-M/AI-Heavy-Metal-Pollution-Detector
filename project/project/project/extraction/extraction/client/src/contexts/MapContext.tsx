import React, { createContext, useContext, useState } from 'react';
import { RiskResult } from '@/components/upload/risk-results-table';

interface MapContextType {
  mapData: RiskResult[];
  updateMapData: (data: RiskResult[]) => void;
}

const defaultContext: MapContextType = {
  mapData: [],
  updateMapData: () => {},
};

export const MapContext = createContext<MapContextType>(defaultContext);

export const useMapContext = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapData, setMapData] = useState<RiskResult[]>([]);

  const updateMapData = (data: RiskResult[]) => {
    setMapData(data);
  };

  return (
    <MapContext.Provider value={{ mapData, updateMapData }}>
      {children}
    </MapContext.Provider>
  );
};