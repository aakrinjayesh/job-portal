/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import socketio from "socket.io-client";
import { LocalStorage } from "../utils";

// Function to create socket connection with token
const getSocket = () => {
  const token = localStorage.getItem("astoken");
  return socketio(import.meta.env.VITE_SOCKET_URI, {
    withCredentials: true,
    auth: { token },
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

// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useEffect, useState } from "react";
// import socketio from "socket.io-client";

// // Create context
// const SocketContext = createContext({
//   socket: null,
//   isConnected: false,
// });

// // Custom hook
// const useSocket = () => useContext(SocketContext);

// // Provider component
// const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("astoken");

//     console.log("Creating socket connection...");

//     // Create socket connection
//     const newSocket = socketio(import.meta.env.VITE_SOCKET_URI, {
//       withCredentials: true,
//       auth: { token },
//     });

//     // Handle connection events
//     newSocket.on("connect", () => {
//       console.log("✅ Socket connected:", newSocket.id);
//       setIsConnected(true);
//     });

//     newSocket.on("disconnect", (reason) => {
//       console.log("❌ Socket disconnected:", reason);
//       setIsConnected(false);
//     });

//     newSocket.on("connect_error", (error) => {
//       console.error("❌ Socket connection error:", error);
//       setIsConnected(false);
//     });

//     setSocket(newSocket);

//     // Cleanup on unmount
//     return () => {
//       console.log("🧹 Cleaning up socket connection");
//       newSocket.off("connect");
//       newSocket.off("disconnect");
//       newSocket.off("connect_error");
//       newSocket.close();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export { SocketProvider, useSocket };
