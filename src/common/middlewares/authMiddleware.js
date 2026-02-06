import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../helpers/exception.helper.js';

const authMiddleware = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new UnauthorizedException("Token không hợp lệ hoặc không đúng định dạng")
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn",err);
    }
}
export default authMiddleware