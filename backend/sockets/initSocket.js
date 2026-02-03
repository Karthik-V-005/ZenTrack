const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSocket(httpServer, { corsOrigin = "*" } = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake?.auth?.token ||
        socket.handshake?.headers?.authorization?.replace(/^Bearer\s+/i, "") ||
        socket.handshake?.query?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {
      // no-op
    });
  });

  return io;
}

module.exports = initSocket;
