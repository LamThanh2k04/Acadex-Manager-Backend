import { responseSuccess } from "../../common/helpers/response.helper.js"
import { scheduleService } from "../../services/student/scheduleService.js"

export const scheduleController = {
    getAllScheduleEnrollment: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const { type } = req.query
            const date = req.query.date || new Date()
            const data = await scheduleService.getAllScheduleEnrollment(studentId, date, type)
            const response = responseSuccess(data, "Lấy lịch học và lịc thi của học sinh đó thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy lịch học và lịc thi của học sinh đó thất bại", err)
            next(err)
        }
    }
}