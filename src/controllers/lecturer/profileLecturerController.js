import { responseSuccess } from "../../common/helpers/response.helper.js"
import { profileLecturerSecvice } from "../../services/lecturer/profileLecturerService.js"

export const profileLecturerController = {
    getInfoLecturer: async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const data = await profileLecturerSecvice.getInfoLecturer(lecturerId)
            const response = responseSuccess(data,'Lấy thông tin của giảng viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin của giảng viên này thất bại',err)
            next(err)            
        }
    }
}