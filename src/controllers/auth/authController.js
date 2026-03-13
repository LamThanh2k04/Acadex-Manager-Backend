import { responseSuccess } from "../../common/helpers/response.helper.js";
import { authService } from "../../services/auth/authService.js"

export const authController = {
    registerAdmin: async (req, res, next) => {
        try {
            const data = await authService.registerAdmin(req.body);
            const response = responseSuccess(data, "Đăng kí tài khoản Admin thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Đăng kí tài khoản Admin thất bại", err)
            next(err)
        }
    },
    login: async (req, res, next) => {
        try {
            const data = await authService.login(req.body)

            // ⭐ SET COOKIE JWT
            res.cookie("token", data.accessToken, {
                httpOnly: true,        // FE không đọc được → an toàn
                secure: false,         // localhost = false
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            })

            const response = responseSuccess(
                { data },   // ❌ không trả token nữa
                "Đăng nhập thành công"
            )

            res.status(response.status).json(response);

        } catch (err) {
            console.error("Đăng nhập thất bại", err)
            next(err)
        }
    }
}
