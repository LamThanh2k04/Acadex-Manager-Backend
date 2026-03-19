import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/student/dashboardService.js"

export const dashboardController = {
    getInfoStudent: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await dashboardService.getInfoStudent(studentId)
            const response = responseSuccess(data, 'Lấy thông tin sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin sinh viên này thất bại', err)
            next(err)
        }
    },
    getAllSemestersSimple: async (req, res, next) => {
        try {
            const data = await dashboardService.getAllSemestersSimple()
            const response = responseSuccess(data, 'Lấy danh sách học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học kì thực tế thất bại', err)
            next(err)
        }
    },
    getAllEnrollmentBySemester: async (req, res, next) => {
        try {

            const studentId = req.user.id
            const semesterId = req.params.semesterId
            const data = await dashboardService.getAllEnrollmentBySemester(studentId, semesterId)
            const response = responseSuccess(data, 'Lấy danh sách học phần đã đăng kí thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học phần đã đăng kí thất bại', err)
            next(err)
        }
    },
    getFinalScoresForChart: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const semesterId = req.params.semesterId
            const data = await dashboardService.getFinalScoresForChart(studentId, semesterId)
            const response = responseSuccess(data, 'Lấy danh sách học các môn học đã có điểm thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học các môn học đã có điểm thất bại', err)
            next(err)
        }
    },
    getResultsIsStudyCredits: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await dashboardService.getResultsIsStudyCredits(studentId)
            const response = responseSuccess(data, 'Lấy tổng tín chỉ đã học thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng tín chỉ đã học thất bại', err)
            next(err)
        }
    },
}