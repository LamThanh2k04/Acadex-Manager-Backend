import { responseSuccess } from "../../common/helpers/response.helper.js"
import { certificateService } from "../../services/student/certificateService.js"

export const certificateController = {
    getAllCertificatesSimpleProgram: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await certificateService.getAllCertificatesSimpleProgram(studentId)
            const response = responseSuccess(data, "Lấy danh sách các chứng chỉ có trong chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy thông tin yêu cầu chứng chỉ thất bại", err)
            next(err)
        }
    },
    getCertificatesProgram: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await certificateService.getCertificatesProgram(studentId)
            const response = responseSuccess(data, "Lấy danh sách các chứng chỉ có trong chương trình có trạng thái thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách các chứng chỉ có trong chương trình có trạng thái thất bại", err)
            next(err)
        }
    },
    submitCertificate: async (req, res, next) => {
        try {
            const imageCertificate = req.file?.path;
            const studentId = req.user.id
            const data = await certificateService.submitCertificate(studentId, imageCertificate, req.body)
            const response = responseSuccess(data, "Nộp chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Nộp chứng chỉ thất bại", err)
            next(err)
        }
    },
    getAllCertificatesStudent: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await certificateService.getAllCertificatesStudent(studentId)
            const response = responseSuccess(data, "Lấy danh sách đã gửi yêu cầu nộp chứng chỉ thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("ấy danh sách đã gửi yêu cầu nộp chứng chỉ thất bại", err)
            next(err)
        }
    }
}