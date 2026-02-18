"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const initSocketServer = (server) => {
    console.log("Initializing Socket.IO server...");
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        console.log("A user connected with ID:", socket.id);
        socket.on("notification", (data) => {
            io.emit("newNotification", data);
        });
        socket.on("disconnect", () => {
            console.log("A user disconnected with ID:", socket.id);
        });
    });
};
exports.initSocketServer = initSocketServer;
//# sourceMappingURL=socketServer.js.map