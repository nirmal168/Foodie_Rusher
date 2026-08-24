import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const joinOrder = (orderId) => {
    if (socket) socket.emit('join-order', orderId);
  };

  const updateLocation = (lat, lng, orderId) => {
    if (socket && user?.role === 'staff') {
      socket.emit('update-location', { userId: user.id || user._id, lat, lng, orderId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinOrder, updateLocation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

