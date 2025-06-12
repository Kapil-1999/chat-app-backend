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
const server = http.createServer(app)

//intitize socket.io
export const  io = new Server(server, {
    cors: {origin : "*"}
});
//store onlin user
export const userSocketMap = {}; //{userId : socketId};

//socket.io connection handler
io.on("connection" , (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if(userId) userSocketMap[userId] = socket.id;
    //Emit online user to all connected client
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect" , () => {
        console.log("User Disconnected" , userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
    
})


const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user/", userRouter);
app.use("/api/messages", messageRouter)
app.get("/", (req, res) => {
    res.send("api is working")
});

app.listen(PORT , () => {
    console.log(`server is listen in http://localhost:${PORT}/`)
})