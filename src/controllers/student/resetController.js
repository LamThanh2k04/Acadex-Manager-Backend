import { responseSuccess } from "../../common/helpers/response.helper.js"
import { resetService } from "../../services/student/resetService.js"

export const resetController = {
    resetPassword : async (req,res,next) => {
        try {
            const studentId = req.user.id
            await resetService.resetPassword(studentId,req.body)
            const response = responseSuccess(null,'Cập nhật mật khẩu thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đổi mật khẩu thất bại',err)
            next(err)
        }
    }
}