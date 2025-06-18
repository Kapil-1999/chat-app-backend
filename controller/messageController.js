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

        const messages = await messageModal.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        });

        const users = await userModal.find({
            _id: { $in: [myId, selectedUserId] }
        }).select('profilePic');

        const userImageMap = {};
        users.forEach(user => {
            userImageMap[user._id.toString()] = user.profilePic;
        });

        const updatedMessages = messages.map(msg => {
            return {
                ...msg.toObject(),
                senderImage: userImageMap[msg.senderId.toString()] || '',
                receiverImage: userImageMap[msg.receiverId.toString()] || ''
            };
        });

        await messageModal.updateMany(
            { senderId: selectedUserId, receiverId: myId },
            { seen: true }
        );

        return ResponseService.success(res, updatedMessages);
    } catch (error) {
        console.log(error.message);
        ResponseService.error(res, error.message);
    }
};

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
        const { text } = req.body
        const receiverId = req.params.id;
        const senderId = req.user.id;

        let imageUrl;
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: 'message_images'
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await messageModal.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        const sender = await userModal.findById(senderId).select('profilePic');
        const messageWithSenderImage = {
            ...newMessage.toObject(),
            senderImage: sender?.profilePic || '',
        };
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", messageWithSenderImage);
        }

        return ResponseService.success(res, messageWithSenderImage);

    } catch (error) {
        console.log(error.message);
        ResponseService.error(res, error.message);
    }
}

export { getUsersForSidebar, getMessage, markMessageAsSeen, sendMessage }