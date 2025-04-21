import express from "express";
import { Login, register } from "../controller/userController.js";

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', Login)
export default userRouter;