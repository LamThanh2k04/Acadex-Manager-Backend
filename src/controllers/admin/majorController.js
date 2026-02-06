import { responseSuccess } from "../../common/helpers/response.helper.js"
import { majorService } from "../../services/admin/majorService.js"


export const majorController = {
    createMajor: async (req, res, next) => {
        try {
            const data = await majorService.createMajor(req.body)
            const response = responseSuccess(data, "Tạo ngành thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo ngành thất bại", err)
            next(err)
        }
    },
    updateMajorInfo: async (req, res, next) => {
        try {
            const majorId = req.params.majorId
            const data = await majorService.updateMajorInfo(majorId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin ngành thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin ngành thất bại", err)
            next(err)
        }
    },
    updateMajorStatus: async (req, res, next) => {
        try {
            const majorId = req.params.majorId
            const data = await majorService.updateMajorStatus(majorId, req.body)
            const response = responseSuccess(data, "Cập nhật trạng thái ngành thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái ngành thất bại", err)
            next(err)
        }
    },
    getAllMajors: async (req, res, next) => {
        try {
            const majorName = req.query.majorName || "";
            const facultyId = req.query.facultyId
            const page = req.query.page || 1;

            const data = await majorService.getAllMajors(majorName,facultyId, page)
            const response = responseSuccess(data, "Lấy danh sách ngành có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách ngành có phân trang thất bại", err)
            next(err)
        }
    },
    getAllMajorsSimple: async (req, res, next) => {
        try {
            const data = await majorService.getAllMajorsSimple()
            const response = responseSuccess(data, "Lấy danh sách ngành thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách ngành thất bại", err)
            next(err)
        }
    }

}