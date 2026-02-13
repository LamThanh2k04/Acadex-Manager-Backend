import { responseSuccess } from "../../common/helpers/response.helper.js"
import { classService } from "../../services/admin/classService.js"

export const classController = {
    createClass: async (req, res, next) => {
        try {
            const data = await classService.createClass(req.body)
            const response = responseSuccess(data, "Tạo lớp thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo lớp thất bại", err)
            next(err)
        }
    },
    updateClassInfo: async (req, res, next) => {
        try {
            const classId = req.params.classId
            const data = await classService.updateClassInfo(classId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin lớp thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin lớp thất bại", err)
            next(err)
        }
    },
    updateClassStatus: async (req, res, next) => {
        try {
            const classId = req.params.classId
            const data = await classService.updateClassStatus(classId, req.body)
            const response = responseSuccess(data, "Cập nhật trạng thái lớp thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái lớp thất bại", err)
            next(err)
        }
    },
    getAllClasses: async (req, res, next) => {
        try {
            const { className, majorName, homeroomLecturerName } = req.query
            const page = req.query.page || 1
            const data = await classService.getAllClasses(className, majorName, homeroomLecturerName, page)
            const response = responseSuccess(data, "Lấy danh sách lớp có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách lớp có phân trang thất bại", err)
            next(err)
        }
    },
    getAllClassesSimple: async (req, res, next) => {
        try {
            const data = await classService.getAllClassesSimple()
            const response = responseSuccess(data, "Lấy danh sách lớp thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách lớp thất bại", err)
            next(err)
        }
    },
}