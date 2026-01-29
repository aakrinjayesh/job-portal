/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";

// Function to create socket connection with token
const getSocket = () => {
  const token = localStorage.getItem("astoken");
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
    transports: ["websocket"],
  });
};

// Create context
const SocketContext = createContext({
  socket: null,
});

// Custom hook
const useSocket = () => useContext(SocketContext);

// Provider component
const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(getSocket());
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
