import { responseSuccess } from "../../common/helpers/response.helper.js"
import { resetService } from "../../services/lecturer/resetService.js"

export const resetController = {
    resetPassword : async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            await resetService.resetPassword(lecturerId,req.body)
            const response = responseSuccess(null,'Cập nhật mật khẩu thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đổi mật khẩu thất bại',err)
            next(err)
        }
    }
}