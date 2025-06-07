import express from "express";
import { checkAuth, Login, register, updateProfile } from "../controller/userController.js";
import Auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', Login);
userRouter.post('/update-profile', Auth,upload.single('profilePic'), updateProfile);
userRouter.get("/check", Auth , checkAuth)

export default userRouter;