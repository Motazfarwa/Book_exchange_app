import { io } from 'socket.io-client';

let socket = null;
let reconnectInterval = null;
let notificationListeners = [];
let messageNotificationListeners = [];
let chatListeners = [];
const SERVER_URL = 'http://localhost:4000';

export const initializeSocket = (token) => {
  if (!token) {
    console.warn("No token available for socket connection");
    return null;
  }
  
  // Close existing socket if any
  closeSocket();
  
  console.log("Initializing new socket connection with token:", token.substring(0, 10) + "...");

  try {
    // Create socket connection with auth token
    socket = io(SERVER_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ['websocket', 'polling']  // Try WebSocket first, fallback to polling
    });
    
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully!');
      clearReconnectInterval();
    });
    
    socket.on('connected', (data) => {
      console.log('Server confirmed connection for user:', data.userId);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      startReconnectInterval(token);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // If the server initiated the disconnect, try to reconnect
        startReconnectInterval(token);
      }
    });
    
    // Listen for new notifications and dispatch based on type
    socket.on('new_notification', (notification) => {
      console.log('Received real-time notification:', notification);
      
      if (notification.type === 'message') {
        // Dispatch to message notification listeners
        messageNotificationListeners.forEach(callback => {
          try {
            callback(notification);
          } catch (e) {
            console.error('Error in message notification listener:', e);
          }
        });
      } else {
        // Dispatch to general notification listeners
        notificationListeners.forEach(callback => {
          try {
            callback(notification);
          } catch (e) {
            console.error('Error in notification listener:', e);
          }
        });
      }
    });
    
    // Listen for new chat messages and dispatch to all listeners
    socket.on('new_message', (message) => {
      console.log('Received new message:', message);
      chatListeners.forEach(callback => {
        try {
          callback(message);
        } catch (e) {
          console.error('Error in chat listener:', e);
        }
      });
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('heartbeat');
      }
    }, 30000);
    
    // Store the heartbeat interval so we can clear it later
    socket.heartbeatInterval = heartbeatInterval;
    
    return socket;
  } catch (error) {
    console.error("Failed to initialize socket:", error);
    return null;
  }
};

// Register exchange/general notification listeners
export const onNewNotification = (callback) => {
  if (typeof callback === 'function') {
    notificationListeners.push(callback);
    
    // Return an unsubscribe function
    return () => {
      notificationListeners = notificationListeners.filter(cb => cb !== callback);
    };
  }
};

// Register message notification listeners
export const onNewMessageNotification = (callback) => {
  if (typeof callback === 'function') {
    messageNotificationListeners.push(callback);
    
    // Return an unsubscribe function
    return () => {
      messageNotificationListeners = messageNotificationListeners.filter(cb => cb !== callback);
    };
  }
};

// Register chat message listeners
export const onNewChatMessage = (callback) => {
  if (typeof callback === 'function') {
    chatListeners.push(callback);
    
    // Return an unsubscribe function
    return () => {
      chatListeners = chatListeners.filter(cb => cb !== callback);
    };
  }
};

// Handle reconnection logic
const startReconnectInterval = (token) => {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
  }
  
  reconnectInterval = setInterval(() => {
    console.log('Attempting to reconnect socket...');
    initializeSocket(token);
  }, 5000);
};

const clearReconnectInterval = () => {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
};

// Get the socket instance
export const getSocket = () => {
  return socket;
};

// Close the socket connection
export const closeSocket = () => {
  if (socket) {
    console.log("Manually closing socket connection");
    if (socket.heartbeatInterval) {
      clearInterval(socket.heartbeatInterval);
    }
    
    // Remove all listeners
    socket.off('new_notification');
    socket.off('new_message');
    socket.off('connect');
    socket.off('connected');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('error');
    
    socket.disconnect();
    socket = null;
  }
  
  // Clear all listeners when socket is closed
  notificationListeners = [];
  messageNotificationListeners = [];
  chatListeners = [];
  
  clearReconnectInterval();
};

// Check connection status
export const isConnected = () => {
  return socket && socket.connected;
};

// Manually reconnect if needed
export const reconnect = (token) => {
  closeSocket();
  return initializeSocket(token);
};

export default {
  initializeSocket,
  getSocket,
  closeSocket,
  isConnected,
  reconnect,
  onNewNotification,
  onNewMessageNotification,
  onNewChatMessage
};
