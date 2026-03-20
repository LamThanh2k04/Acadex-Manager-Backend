import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/lecturer/dashboardService.js"

export const dashboardController = {
       getAllCourseSectionLecturerSimple: async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const data = await dashboardService.getAllCourseSectionLecturerSimple(lecturerId)
            const response = responseSuccess(data,'Lấy danh sách học phần giảng viên đó dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học phần giảng viên đó dạy thất bại",err)
            next(err)
        }
    },
    getOverView: async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const data = await dashboardService.getOverView(lecturerId)
            const response = responseSuccess(data,'Lấy tổng quan của giảng viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy tổng quan của giảng viên này thất bại",err)
            next(err)
        }
    },
      getAttendanceRate: async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const courseSectionId = req.query.courseSectionId
            const data = await dashboardService.getAttendanceRate(lecturerId,courseSectionId)
            const response = responseSuccess(data,'Lấy thống kê điểm danh của giảng viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy thống kê điểm danh của giảng viên này thất bại",err)
            next(err)
        }
    },
    getAvgGradeByClass: async (req,res,next) => {
        try {
            const lecturerId = req.user.id
            const data = await dashboardService.getAvgGradeByClass(lecturerId)
            const response = responseSuccess(data,'Lấy thống kê trung bình các lớp học của giảng viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy thống kê trung bình các lớp học của giảng viên này thất bại",err)
            next(err)
        }
    },
    

}