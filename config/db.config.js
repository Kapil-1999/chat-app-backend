import mongoose from "mongoose";

const ConnectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI).then((res) => console.log("database connected")
    );
}
export default ConnectDB;