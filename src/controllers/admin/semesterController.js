import { responseSuccess } from "../../common/helpers/response.helper.js"
import { semesterService } from "../../services/admin/semesterService.js"

export const semesterController = {
    createSemester: async (req, res, next) => {
        try {
            const data = await semesterService.createSemester(req.body)
            const response = responseSuccess(data, 'Tạo học kì thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo học kì thất bại", err)
            next(err)
        }
    },
    updateSemesterInfo: async (req, res, next) => {
        try {
            const semesterId = req.params.semesterId
            const data = await semesterService.updateSemesterInfo(semesterId, req.body)
            const response = responseSuccess(data, 'Cập nhật thông tin học kì thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("'Cập nhật thông tin học kì thất bại", err)
            next(err)
        }
    },
    updateSemesterStatus: async (req, res, next) => {
        try {
            const semesterId = req.params.semesterId
            const data = await semesterService.updateSemesterStatus(semesterId)
            const response = responseSuccess(data, 'Cập nhật trạng thái học kì thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("'Cập nhật trạng thái học kì thất bại", err)
            next(err)
        }
    },
    getAllSemesters: async (req, res, next) => {
        try {
            const semesterName = req.query.semesterName || ""
            const semesterYear = req.query.semesterYear || ""
            const page = req.query.page || 1
            const data = await semesterService.getAllSemesters(semesterName, semesterYear, page)
            const response = responseSuccess(data, 'Lấy danh sách học kì có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học kì có phân trang thất bại", err)
            next(err)
        }
    },
    getAllSemestersSimple: async (req, res, next) => {
         try {
            const data = await semesterService.getAllSemestersSimple()
            const response = responseSuccess(data, 'Lấy danh sách học kì thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học kì thất bại", err)
            next(err)
        }
    }
}