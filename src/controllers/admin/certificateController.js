import { responseSuccess } from "../../common/helpers/response.helper.js"
import { certificateService } from "../../services/admin/certificateService.js"

export const certificateController = {
    createCertificate: async (req, res, next) => {
        try {
            const data = await certificateService.createCertificate(req.body)
            const response = responseSuccess(data, "Tạo chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo chứng chỉ thất bại", err),
            next(err)
        }
    },
    updateCertificateInfo: async (req, res, next) => {
        try {
            const certificateId = req.params.certificateId
            const data = await certificateService.updateCertificateInfo(certificateId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin chứng chỉ thất bại", err),
            next(err)
        }
    },
    updateCertificateStatus: async (req, res, next) => {
        try {
            const certificateId = req.params.certificateId
            const data = await certificateService.updateCertificateStatus(certificateId)
            const response = responseSuccess(data, "Cập nhật trạng thái chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái chứng chỉ thất bại", err),
            next(err)
        }
    },
    getAllCertificates: async (req, res, next) => {
        try {
            const certificateName = req.query.certificateName
            const page = req.query.page || 1
            const data = await certificateService.getAllCertificates(certificateName, page)
            const response = responseSuccess(data, "Lấy danh sách chứng chỉ có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách chứng chỉ có phân trang thất bại", err),
            next(err)
        }
    },
    getAllCertificatesSimple: async (req, res, next) => {
        try {
            const data = await certificateService.getAllCertificatesSimple()
            const response = responseSuccess(data, "Lấy danh sách chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách chứng chỉ thất bại", err),
            next(err)
        }
    }
}