import { responseSuccess } from "../../common/helpers/response.helper.js"
import { attendanceService } from "../../services/student/attendanceService.js"

export const attendanceController = {
    studentCheckIn: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await attendanceService.studentCheckIn(studentId, req.body)
            const response = responseSuccess(data, 'Điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Điểm danh thất bại', err)
            next(err)
        }
    },
    getSchedulesStudent: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const date = req.query.date || new Date()
            const data = await attendanceService.getSchedulesStudent(studentId, date)
            const response = responseSuccess(data, 'Lấy danh sách buổi học để điểm danh thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách buổi học để điểm danh thất bại', err)
            next(err)
        }
    },
    getAllSemestersSimple: async (req, res, next) => {
        try {
            const data = await attendanceService.getAllSemestersSimple()
            const response = responseSuccess(data, 'Lấy danh sách học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học kì thực tế thất bại', err)
            next(err)
        }
    },
    getAbsentBySemester: async (req, res, next) => {
        try {
            const studentUserId = req.user.id
            const semesterId = req.params.semesterId
            const data = await attendanceService.getAbsentBySemester(studentUserId, semesterId)
            const response = responseSuccess(data, 'Lấy số tiết vắng mặt và vắng có phép của các học phần đã đăng kí thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy số tiết vắng mặt và vắng có phép của các học phần đã đăng kí thất bại', err)
            next(err)
        }
    },
    getTotalabsent: async (req, res, next) => {
        try {
            const studentUserId = req.user.id
            const data = await attendanceService.getTotalabsent(studentUserId)
            const response = responseSuccess(data, 'Lấy tổng số tiết vắng mặt và vắng có phép của tất cả học phần đã đăng kí thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng số tiết vắng mặt và vắng có phép của tất cả học phần đã đăng kí thất bại', err)
            next(err)
        }
    }
}