import express from 'express'
import Auth from '../middleware/auth.js';
import { getMessage, getUsersForSidebar, markMessageAsSeen, sendMessage } from '../controller/messageController.js';
import upload from '../middleware/multer.js';
const messageRouter = express.Router();

messageRouter.get("/users", Auth, getUsersForSidebar);
messageRouter.get("/message/:id", Auth , getMessage);
messageRouter.put("/mark/:id", Auth, markMessageAsSeen);
messageRouter.post("/send/:id", Auth ,upload.single('image'), sendMessage)

export default messageRouter;