
import { responseSuccess } from "../../common/helpers/response.helper.js"
import { subjectService } from "../../services/admin/subjectService.js"

export const subjectController = {
    createSubject: async (req, res, next) => {
        try {
            const data = await subjectService.createSubject(req.body)
            const response = responseSuccess(data, "Tạo môn học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo môn học thất bại", err)
            next(err)
        }
    },
    updateSubjectInfo: async (req, res, next) => {
        try {
            const subjectId = req.params.subjectId
            const data = await subjectService.updateSubjectInfo(subjectId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin môn học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin môn học thất bại")
            next(err)
        }
    },
    updateSubjectStatus: async (req, res, next) => {
        try {
            const subjectId = req.params.subjectId
            const data = await subjectService.updateSubjectStatus(subjectId)
            const response = responseSuccess(data, "Cập nhật trạng thái môn học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái môn học thất bại")
            next(err)
        }
    },
    getAllSubjects: async (req, res, next) => {
        try {
            const subjectName = req.query.subjectName || ""
            const page = req.query.page || 1
            const data = await subjectService.getAllSubjects(subjectName, page)
            const response = responseSuccess(data, "Lấy danh sách môn học có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách môn học có phân trang thất bại")
            next(err)
        }
    },
    getAllSubjectsSimple: async (req, res, next) => {
        try {
            const data = await subjectService.getAllSubjectsSimple()
            const response = responseSuccess(data, "Lấy danh sách môn học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách môn học thất bại")
            next(err)
        }
    }
}