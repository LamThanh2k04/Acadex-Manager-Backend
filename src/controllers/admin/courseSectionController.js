import { responseSuccess } from "../../common/helpers/response.helper.js"
import { courseSectionService } from "../../services/admin/courseSectionService.js"

export const courseSectionController = {
    createCourseSection: async (req, res, next) => {
        try {
            const data = await courseSectionService.createCourseSection(req.body)
            const response = responseSuccess(data, "Tạo học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo học phần thất bại", err)
            next(err)
        }
    },
    updateCourseSectionInfo: async (req, res, next) => {
        try {
            const courseSectionId = req.params.courseSectionId
            const data = await courseSectionService.updateCourseSectionInfo(courseSectionId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin học phần thất bại", err)
            next(err)
        }
    },
    updateCourseSectionStatus: async (req, res, next) => {
        try {
            const courseSectionId = req.params.courseSectionId
            const data = await courseSectionService.updateCourseSectionStatus(courseSectionId)
            const response = responseSuccess(data, "Cập nhật trạng thái học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái học phần thất bại", err)
            next(err)
        }
    },
    getAllCourseSections: async (req, res, next) => {
        try {
            const { subjectName, className, lecturerName } = req.query
            const page = req.query.page || 1
            const data = await courseSectionService.getAllCourseSections(subjectName, className, lecturerName, page)
            const response = responseSuccess(data, "Lấy danh sách học phần có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học phần có phân trang thất bại", err)
            next(err)
        }
    },
    getCourseSectionBySemester: async (req, res, next) => {
        try {
            const semesterId = req.params.semesterId
            const data = await courseSectionService.getCourseSectionBySemester(semesterId)
            const response = responseSuccess(data, "Lấy danh sách mã học phần của học kì thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách mã học phần của học kì thất bại", err)
            next(err)
        }
    }
}