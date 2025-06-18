import express from "express";
import cors from "cors";
import 'dotenv/config';
import ConnectDB from "./config/db.config.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from 'http';

ConnectDB();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin : "*" },
     path: "/socket.io"
});

export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user/", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
    res.send("API is working");
});

// ✅ Start HTTP server, not app directly
server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}/`);
});
