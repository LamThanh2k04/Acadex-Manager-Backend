import { responseSuccess } from "../../common/helpers/response.helper.js"
import { attendanceService } from "../../services/admin/attendanceService.js"

export const attendanceController = {
    getAllAttendances : async (req,res,next) => {
        try {
            const date = req.query.date
            const page = req.query.page || 1
            const data = await attendanceService.getAllAttendances(date,page)
            const response = responseSuccess(data,'Lấy danh sách điểm danh có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách điểm danh có phân trang thất bại',err)
            next(err)
        }
    },
    getInfoAttendancesSession:async (req,res,next) => {
         try {
            const attendanceId = req.params.attendanceId
            const data = await attendanceService.getInfoAttendancesSession(attendanceId)
            const response = responseSuccess(data,'Thông tin buổi điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Thông tin buổi điểm danh thất bại',err)
            next(err)
        }
    }
}