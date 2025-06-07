import jwt from 'jsonwebtoken';
import userModal from '../modal/userModal.js';
import ResponseService from '../sevices/httpStatus.js';
const Auth = async (req, res, next) => {
    try {
        let beaerToken = req.headers.authorization;
        if (!beaerToken || !beaerToken.startsWith('Bearer ')) {
            return ResponseService.unauthorized(res, 'Unauthorized - Please login again')
        }
    
        const token = beaerToken.split(' ')[1];
        if (!token) {
            return ResponseService.unauthorized(res, 'Unauthorized - Please login again');
        };
        let jwt_verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!jwt_verify) {
            return ResponseService.unauthorized(res, 'Unauthorized - Please login again');
        };
        const user = await userModal.findById(jwt_verify.id).select("-password");
        if(!user) {
            return ResponseService.notFound(res, 'User not found')
        }
        req.user = user;
        next();
    } catch(error) {
        console.log(error);
        return ResponseService.error(res, error.message);
        
    }
}

export default Auth;