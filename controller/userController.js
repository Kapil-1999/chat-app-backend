import userModal from "../modal/userModal.js";
import ResponseService from "../sevices/httpStatus.js";
import validator from "validator";
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/utils.js";


const register = async (req, res) => {
    try {
        const { email, fullName, password, bio } = req.body;

        if (!email || !fullName || !password || !bio) {
            return ResponseService.badRequest(res, 'Somthing is missing')
        }
        if (!validator.isEmail(email)) {
            return ResponseService.badRequest(res, 'Please enter a valid email')
        }

        const user = await userModal.findOne({ email });
        if (user) {
            return ResponseService.badRequest(res, 'Already Exist')
        }

        let hashpwd = await bcrypt.hash(password, 10)
        let newUser = await new userModal({
            email: email,
            password: hashpwd,
            fullName: fullName,
            bio: bio
        });
        await newUser.save();
        const token = generateToken(newUser._id);
        const userWithoutPassword = await userModal.findById(newUser._id).select('-password');
        const data = {
            token: token,
            user: userWithoutPassword
        }
        return ResponseService.success(res, data, 'User Created Successfully')

    } catch (error) {
        return ResponseService.error(res, error.message)
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return ResponseService.badRequest(res, 'Somthing is missing')
        }

        if (!validator.isEmail(email)) {
            return ResponseService.badRequest(res, "Please inter a valid email")
        }

        const user = await userModal.findOne({ email });
        if (!user) {
            return ResponseService.notFound(res, "User not exist")
        }
        let comparePwd = await bcrypt.compare(password, user.password);
        if(!comparePwd) {
            return ResponseService.badRequest(res, "Password doest not match");
        }
        let token = await generateToken(user._id);
        let withOutPwdUser = await userModal.findById(user._id).select("-password")
        let newUser = {
            user: withOutPwdUser, token: token
        }

        return ResponseService.success(res, newUser, "Login Successfully")


    } catch (error) {
        return ResponseService.error(res, error.message)
    }
}
export { register, Login }