import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { sound } from '../utils/audio';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    const socketServerUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketServerUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('📡 Connected to MedEmergency Real-Time Server:', newSocket.id);
      
      // If store owner, join store room
      if (user?.role === 'store' && user?.store?.id) {
        newSocket.emit('join_store_room', user.store.id);
      }
    });

    // Listen for new emergency/standard requests (Store owner view)
    newSocket.on('new_request', (requestData) => {
      console.log('🚨 Incoming Medicine Request received via Socket:', requestData);
      
      if (requestData.sound_alert) {
        sound.playEmergencyAlarm();
      } else {
        sound.playPing();
      }

      setIncomingRequests((prev) => [requestData, ...prev]);
      
      // Add visual alert banner
      setLiveAlerts((prev) => [
        {
          id: Date.now(),
          type: requestData.is_emergency ? 'emergency' : 'standard',
          title: requestData.is_emergency ? '🚨 CRITICAL EMERGENCY REQUEST' : 'New Medicine Request',
          message: `Request #${requestData.requestId} from patient ${requestData.distance_km}km away`,
          data: requestData,
        },
        ...prev,
      ]);
    });

    // Listen for request status update (e.g. matched by another store)
    newSocket.on('request_status_update', (update) => {
      setIncomingRequests((prev) =>
        prev.map((req) =>
          req.requestId === update.requestId
            ? { ...req, status: update.status, winningStoreName: update.winningStoreName }
            : req
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.id, user?.store?.id]);

  const removeAlert = (alertId) => {
    setLiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const clearIncomingRequest = (requestId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        incomingRequests,
        setIncomingRequests,
        liveAlerts,
        removeAlert,
        clearIncomingRequest,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
