import { responseSuccess } from "../../common/helpers/response.helper.js";
import { authService } from "../../services/auth/authService.js"

export const authController = {
    registerAdmin : async (req,res,next) => {
        try {
            const data = await authService.registerAdmin(req.body);
            const response = responseSuccess(data,"Đăng kí tài khoản Admin thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Đăng kí tài khoản Admin thất bại",err)
            next(err)
        }
    },
    login : async (req,res,next) => {
        try {
            console.log(req.body)
            const data = await authService.login(req.body)
            const response = responseSuccess(data,"Đăng nhập thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Đăng nhập thất bại",err)
            next(err)
        }
    }
}
