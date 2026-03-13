import { responseSuccess } from "../../common/helpers/response.helper.js"
import { attendanceService } from "../../services/lecturer/attendanceService.js"

export const attendanceController = {
    getAllSchedulesLecturer: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const date = req.query.date || new Date()
            const data = await attendanceService.getAllSchedulesLecturer(lecturerId, date)
            const response = responseSuccess(data, 'Lấy lịch dạy của giảng viên theo ngày này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy lịch dạy của giảng viên theo ngày này thất bại', err)
            next(err)
        }
    },
    getStudentsOfSchedule: async (req, res, next) => {
        try {
            const scheduleId = req.params.scheduleId
            const search = req.query.search || ""
            const date = req.query.date
            const data = await attendanceService.getStudentsOfSchedule(scheduleId, date, search)
            const response = responseSuccess(data, 'Lấy danh sách sinh viên của lịch thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách sinh viên của lịch thất bại', err)
            next(err)
        }
    },
    startAttendance: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const data = await attendanceService.startAttendance(lecturerId, req.body)
            const response = responseSuccess(data, 'Bắt đầu điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Bắt đầu điểm danh thất bại', err)
            next(err)
        }
    },
    stopAttendance: async (req, res, next) => {
        try {
            const sessionId = req.params.sessionId
            const data = await attendanceService.stopAttendance(sessionId)
            const response = responseSuccess(data, 'Ngưng điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Ngưng điểm danh thất bại', err)
            next(err)
        }
    },
    sendAttendanceReport: async (req, res, next) => {
        try {
            const sessionId = req.params.sessionId
            const data = await attendanceService.sendAttendanceReport(sessionId, req.body)
            const response = responseSuccess(data, 'Gửi danh sách điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Gửi danh sách điểm danh thất bại', err)
            next(err)
        }
    },
    updateAttendanceStatus: async (req, res, next) => {
        try {
            const attendanceId = req.params.attendanceId
            const data = await attendanceService.updateAttendanceStatus(attendanceId, req.body)
            const response = responseSuccess(data, 'Cập nhật trạng thái điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái điểm danh thất bại', err)
            next(err)
        }
    }
}