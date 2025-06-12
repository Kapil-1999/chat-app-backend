import messageModal from "../modal/messageModel.js";
import userModal from "../modal/userModal.js";
import ResponseService from "../sevices/httpStatus.js"
import cloudinary from "../utils/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all user except loggin user
const getUsersForSidebar = async (req, res) => {
    try {
        const myid = req.user.id;
        const filteredUser = await userModal.find({ _id: { $ne: myid } }).select("-password");

        //count message of unseen message
        const unseenMessage = {};
        const promises = filteredUser.map(async (user) => {
            const message = await messageModal.find({ senderId: user._id, receiverId: myid, seen: false });
            if (message.length > 0) {
                unseenMessage[user._id] = message.length
            }
        })

        await Promise.all(promises);
        ResponseService.success(res, { user: filteredUser }, unseenMessage);
    } catch (error) {
        console.log(error.message);
        return ResponseService.error(res, error.message)
    }
};

//getAll messages for selected user

const getMessage = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user.id;
        const message = await messageModal.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        });

        await messageModal.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
        return ResponseService.success(res, message)

    } catch (error) {
        console.log(error.message);
        ResponseService.error(res, error.message)
    }
}

//api to mark message as seen using message id
const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await messageModal.findByIdAndUpdate(id, { seen: true })
        return ResponseService.success(res)
    } catch (error) {
        console.log(error.message);
        ResponseService.error(error.message)
    }
}

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user.id;
        let imageUrl;
        if (image) {
            const uploadRespinse = await cloudinary.uploader.upload(image);
            imageUrl = uploadRespinse.secure_url;
        }
        const newMessage = await messageModal.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        //emit to new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage" , newMessage)
        }
        return ResponseService.success(res, newMessage)

    } catch (error) {
        console.log(error.message);
        ResponseService.error(error.message)

    }
}

export { getUsersForSidebar, getMessage, markMessageAsSeen, sendMessage }