import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const LocationContext = createContext();

const defaultDistricts = ["Ahmedabad", "Surat", "Vadodara", "Rajkot"];
const defaultAreasByDistrict = {
  Ahmedabad: [
    { name: "Satellite", pincode: "380015", coordinates: { lat: 23.0298, lng: 72.5333 } },
    { name: "Navrangpura", pincode: "380009", coordinates: { lat: 23.0373, lng: 72.5613 } },
    { name: "Prahlad Nagar", pincode: "380015", coordinates: { lat: 23.0120, lng: 72.5108 } },
    { name: "Vastrapur", pincode: "380015", coordinates: { lat: 23.0350, lng: 72.5293 } },
    { name: "Bopal", pincode: "380058", coordinates: { lat: 23.0338, lng: 72.4633 } }
  ],
  Surat: [
    { name: "Adajan", pincode: "395009", coordinates: { lat: 21.1925, lng: 72.7997 } },
    { name: "Vesu", pincode: "395007", coordinates: { lat: 21.1415, lng: 72.7744 } },
    { name: "Piplod", pincode: "395007", coordinates: { lat: 21.1593, lng: 72.7795 } },
    { name: "Varachha", pincode: "395006", coordinates: { lat: 21.2121, lng: 72.8660 } }
  ],
  Vadodara: [
    { name: "Alkapuri", pincode: "390007", coordinates: { lat: 22.3117, lng: 73.1706 } },
    { name: "Sayajigunj", pincode: "390005", coordinates: { lat: 22.3106, lng: 73.1873 } },
    { name: "Gotri", pincode: "390021", coordinates: { lat: 22.3218, lng: 73.1417 } }
  ],
  Rajkot: [
    { name: "Kalavad Road", pincode: "360005", coordinates: { lat: 22.2844, lng: 70.7600 } },
    { name: "University Road", pincode: "360005", coordinates: { lat: 22.2917, lng: 70.7728 } },
    { name: "Mundra Road", pincode: "360001", coordinates: { lat: 22.2989, lng: 70.7960 } }
  ]
};

export const LocationProvider = ({ children }) => {
  const [districts, setDistricts] = useState(defaultDistricts);
  const [selectedDistrict, setSelectedDistrict] = useState("Ahmedabad");
  const [areas, setAreas] = useState(defaultAreasByDistrict["Ahmedabad"] || []);
  const [selectedArea, setSelectedArea] = useState(defaultAreasByDistrict["Ahmedabad"]?.[0] || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get('/api/locations');
        if (res.data && res.data.length > 0) {
          setDistricts(res.data);
        } else {
          setDistricts(defaultDistricts);
        }
      } catch (err) {
        console.error("Failed to fetch districts, using fallback:", err);
        setDistricts(defaultDistricts);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!selectedDistrict) return;
      try {
        const res = await axios.get(`/api/locations/${selectedDistrict}/areas`);
        if (res.data && res.data.length > 0) {
          setAreas(res.data);
          setSelectedArea(res.data[0]);
        } else {
          const fallback = defaultAreasByDistrict[selectedDistrict] || [];
          setAreas(fallback);
          setSelectedArea(fallback[0] || null);
        }
      } catch (err) {
        console.error("Failed to fetch areas, using fallback:", err);
        const fallback = defaultAreasByDistrict[selectedDistrict] || [];
        setAreas(fallback);
        setSelectedArea(fallback[0] || null);
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

