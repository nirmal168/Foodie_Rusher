import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("Ahmedabad");
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/locations');
        setDistricts(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch districts", err);
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!selectedDistrict) return;
      try {
        const res = await axios.get(`http://localhost:5001/api/locations/${selectedDistrict}/areas`);
        setAreas(res.data);
        if (res.data.length > 0) setSelectedArea(res.data[0]);
      } catch (err) {
        console.error("Failed to fetch areas", err);
      }
    };
    fetchAreas();
  }, [selectedDistrict]);

  return (
    <LocationContext.Provider value={{ 
      districts, 
      selectedDistrict, 
      setSelectedDistrict, 
      areas, 
      selectedArea, 
      setSelectedArea,
      loading 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

