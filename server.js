import express from "express";
import cors from "cors";
import 'dotenv/config';
import ConnectDB from "./config/db.config.js";
import userRouter from "./routes/userRoutes.js";

ConnectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/user/", userRouter)
app.get("/", (req, res) => {
    res.send("api is working")
});

app.listen(PORT , () => {
    console.log(`server is listen in http://localhost:${PORT}/`)
})