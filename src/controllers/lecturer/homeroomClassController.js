import { responseSuccess } from "../../common/helpers/response.helper.js"
import { homeroomClassService } from "../../services/lecturer/homeroomClassService.js"

export const homeroomClassController = {
    getAllStudents : async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const search = req.query.search || ""
            const page = req.query.page || 1
            const data = await homeroomClassService.getAllStudents(lecturerId,search,page)
            const response = responseSuccess(data,'Lấy danh sách lớp chủ nhiệm thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lớp chủ nhiệm thất bại',err)
            next(err)
        }
    }
}