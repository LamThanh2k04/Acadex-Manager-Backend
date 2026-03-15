import { responseSuccess } from "../../common/helpers/response.helper.js"
import { dashboardService } from "../../services/admin/dashboardService.js"

export const dashboardController = {
    getOverView: async (req, res, next) => {
        try {
            const data = await dashboardService.getOverView()
            const response = responseSuccess(data, "Lấy tổng quan quản trị viên thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy tổng quan quản trị viên thất bại", err)
            next(err)
        }
    },
    getPassFailStatus: async (req, res, next) => {
        try {
            const subjectId = req.query.subjectId
            const data = await dashboardService.getPassFailStatus(subjectId)
            const response = responseSuccess(data, "Lấy tỉ lệ đậu/rớt của toàn thể học sinh thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy tỉ lệ đậu/rớt của toàn thể học sinh thất bại", err)
            next(err)
        }
    },
    getGenders: async (req, res, next) => {
        try {
            const role = req.query.role 
            const data = await dashboardService.getGenders(role)
            const response = responseSuccess(data, "Lấy giới tính nam/nữ toàn hệ thống hoặc giới tính nam nữ theo role thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy giới tính nam/nữ toàn hệ thống hoặc giới tính nam nữ theo role thất bại", err)
            next(err)
        }
    },
    getPassFailStatus: async (req,res,next) => {
        try {
            const subjectId = req.query.subjectId
            const data = await dashboardService.getPassFailStatus(subjectId)
            const response = responseSuccess(data, "Lấy tỉ lệ đậu/rớt thành công")
            res.status(response.status).json(response)
        } catch (err) {
             console.error("Lấy tỉ lệ đậu/rớt thất bại", err)
            next(err)
        }
    },
    getTopStudentGpa : async (req,res,next) => {
        try {
            const data = await dashboardService.getTopStudentGpa()
            const response = responseSuccess(data, "Lấy top học sinh có gpa cao nhất thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy top học sinh có gpa cao nhất thất bại", err)
            next(err)
        }
    },
    getLineChartRevenueLineChart : async (req,res,next) => {
        try {
            const year = req.query.year || new Date().getFullYear()
             const data = await dashboardService.getLineChartRevenueLineChart(year)
            const response = responseSuccess(data, "Lấy doanh thu của những tháng trong năm thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy doanh thu của những tháng trong năm thất bại", err)
            next(err)
        }
    },
    getAllSchedules: async (req,res,next) => {
        try {
            const date = req.query.date || new Date()
            const page = req.query.page || 1
            const data = await dashboardService.getAllSchedules(date,page)
            const response = responseSuccess(data,'Lấy danh sách lịch có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách lịch có phân trang thất bại',err)
            next(err)
        }
    }
}