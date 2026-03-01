import { responseSuccess } from "../../common/helpers/response.helper.js"
import { profileStudentService } from "../../services/student/profileStudentService.js"

export const profileStudentController = {
    getInfoStudent: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await profileStudentService.getInfoStudent(studentId)
            const response = responseSuccess(data, 'Lấy thông tin của sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin của sinh viên này thất bại',err)
            next(err)
        }
    }
}