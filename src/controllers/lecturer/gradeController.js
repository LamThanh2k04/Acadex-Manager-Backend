import { responseSuccess } from "../../common/helpers/response.helper.js"
import { gradeService } from "../../services/lecturer/gradeService.js"

export const gradeController = {
    confirmGrades : async (req,res,next) => {
        try {
            await gradeService.confirmGrades(req.body)
            const response = responseSuccess(null,'Xác nhận nhập điểm cho sinh viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xác nhận nhập điểm cho sinh viên thất bại',err)
            next(err)
        }
    }
}