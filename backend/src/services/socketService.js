const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const connectedUsers = new Map(); // userId -> Set of socketIds
const storeSockets = new Map();   // storeId -> Set of socketIds

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow client connections
      methods: ['GET', 'POST', 'PUT'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(); // Allow guest/public sockets, but identify if token given
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_medemergency_jwt_key_2026_secure');
      socket.user = decoded;
      next();
    } catch (err) {
      // Continue unauthenticated
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    const userRole = socket.user?.role;

    if (userId) {
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(socket.id);
      socket.join(`user_${userId}`);
    }

    console.log(`🔌 [Socket.io] Connected: socketId=${socket.id}, user=${userId || 'guest'} (Role: ${userRole || 'none'})`);

    // Store joins store-specific room
    socket.on('join_store_room', (storeId) => {
      if (storeId) {
        socket.join(`store_${storeId}`);
        socket.join('all_stores');
        if (!storeSockets.has(storeId)) {
          storeSockets.set(storeId, new Set());
        }
        storeSockets.get(storeId).add(socket.id);
        console.log(`🏪 [Socket.io] Store ${storeId} joined room store_${storeId}`);
      }
    });

    // Patient joins specific request tracking room
    socket.on('join_request_room', (requestId) => {
      if (requestId) {
        socket.join(`request_${requestId}`);
        console.log(`📡 [Socket.io] Socket ${socket.id} joined tracking room for request_${requestId}`);
      }
    });

    socket.on('disconnect', () => {
      if (userId && connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
        }
      }
      for (const [storeId, sockets] of storeSockets.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            storeSockets.delete(storeId);
          }
        }
      }
      console.log(`🔌 [Socket.io] Disconnected: socketId=${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized.');
  }
  return io;
}

/**
 * Broadcast emergency / standard request to specific stores
 */
function broadcastNewRequestToStores(targetStores, requestData) {
  if (!io) return;

  for (const store of targetStores) {
    // Send to specific store room
    io.to(`store_${store.id}`).emit('new_request', {
      ...requestData,
      distance_km: store.distance_km,
      target_store_id: store.id,
      sound_alert: requestData.is_emergency,
    });
  }

  // Also broadcast to admin live monitor room
  io.to('admin_monitor').emit('admin_new_request', requestData);
}

/**
 * Notify patient and update stores on availability responses
 */
function emitMatchFound(requestId, patientId, matchedStore, allAvailableStores) {
  if (!io) return;

  const payload = {
    requestId,
    matchedStore,
    allAvailableStores,
    timestamp: new Date().toISOString(),
  };

  // Notify patient in request room and user room
  io.to(`request_${requestId}`).emit('request_matched', payload);
  io.to(`user_${patientId}`).emit('request_matched', payload);

  // Notify all stores that this request has been matched
  io.emit('request_status_update', {
    requestId,
    status: 'matched',
    winningStoreId: matchedStore.id,
    winningStoreName: matchedStore.store_name,
  });

  // Notify admin room
  io.to('admin_monitor').emit('admin_request_matched', payload);
}

/**
 * Emit general response update to patient tracking room
 */
function emitResponseUpdate(requestId, responseData) {
  if (!io) return;
  io.to(`request_${requestId}`).emit('store_response_update', responseData);
}

/**
 * Notify status change (e.g. resolved, expired, radius expanded)
 */
function emitRequestStatusChange(requestId, status, extraData = {}) {
  if (!io) return;
  io.to(`request_${requestId}`).emit('request_status_change', {
    requestId,
    status,
    ...extraData,
  });
}

module.exports = {
  initSocket,
  getIO,
  broadcastNewRequestToStores,
  emitMatchFound,
  emitResponseUpdate,
  emitRequestStatusChange,
};
