import { responseSuccess } from "../../common/helpers/response.helper.js"
import { scheduleService } from "../../services/lecturer/scheduleService.js"

export const scheduleController = {
    getAllScheduleLecturer: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const date = req.query.date || new Date()
            const data = await scheduleService.getAllScheduleLecturer(lecturerId, date)
            const response = responseSuccess(data, "Lấy lịch giảng dạy của giảng viên đó thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy lịch giảng dạy của giảng viên đó thất bại", err)
            next(err)
        }
    }
}