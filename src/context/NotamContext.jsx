import { createContext, useContext, useState, useEffect } from 'react';

const NotamContext = createContext();

// Helper to create a date relative to now
const makeDate = (year, month, day, hour = 0, minute = 0) => {
  return new Date(year, month - 1, day, hour, minute).toISOString().slice(0, 16);
};

export const NotamProvider = ({ children }) => {
  const [notams, setNotams] = useState([]);

  useEffect(() => {
    fetchNotams();
  }, []);

  const fetchNotams = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notams');
      const data = await response.json();
      setNotams(data);
    } catch (err) {
      console.error("Error fetching notams:", err);
    }
  };

  const addNotam = async (newNotam) => {
    try {
      const response = await fetch('http://localhost:3000/api/notams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotam)
      });
      const data = await response.json();
      if (data.success) {
        setNotams(prev => [data.notam, ...prev]);
      }
    } catch (err) {
      console.error("Error adding notam:", err);
    }
  };

  const updateNotam = (id, updatedData) => {
    setNotams(prev => prev.map(notam => notam.id === id ? { ...notam, formData: updatedData } : notam));
  };

  const deleteNotam = (id) => {
    setNotams(prev => prev.filter(notam => notam.id !== id));
  };

  return (
    <NotamContext.Provider value={{ notams, addNotam, updateNotam, deleteNotam }}>
      {children}
    </NotamContext.Provider>
  );
};

export const useNotams = () => useContext(NotamContext);
