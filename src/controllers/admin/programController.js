import { responseSuccess } from "../../common/helpers/response.helper.js"
import { programService } from "../../services/admin/programService.js"

export const programController = {
    createProgram: async (req, res, next) => {
        try {
            const data = await programService.createProgram(req.body)
            const response = responseSuccess(data, "Tạo chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo chương trình thất bại", err)
            next(err)
        }
    },
    updateProgramInfo: async (req, res, next) => {
        try {
            const programId = req.params.programId
            const data = await programService.updateProgramInfo(programId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin chương trình thất bại", err)
            next(err)
        }
    },
    updateProgramStatus: async (req, res, next) => {
        try {
            const programId = req.params.programId
            const data = await programService.updateProgramStatus(programId)
            const response = responseSuccess(data, "Cập nhật trạng thái chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái chương trình thất bại", err)
            next(err)
        }
    },
    getAllPrograms: async (req, res, next) => {
        try {
            const programName = req.query.programName
            const page = req.query.page || 1
            const data = await programService.getAllPrograms(programName, page)
            const response = responseSuccess(data, "Lấy danh sách chương trình có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách chương trình có phân trang thất bại", err)
            next(err)
        }
    },
    getAllProgramsSimple: async (req, res, next) => {
        try {
            const data = await programService.getAllProgramsSimple()
            const response = responseSuccess(data, "Lấy danh sách chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách chương trình thất bại", err)
            next(err)
        }
    },
    getProgramInfo: async (req, res, next) => {
        try {
            const programId = req.params.programId
            const data = await programService.getProgramInfo(programId)
            const response = responseSuccess(data, "Lấy thông tin chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy thông tin chương trình thất bại", err)
            next(err)
        }
    },
    addSubjectToProgram: async (req, res, next) => {
        try {
            const programId = req.params.programId
            await programService.addSubjectToProgram(programId, req.body)
            const response = responseSuccess("Gán môn học vào chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Gán môn học vào chương trình thất bại", err)
            next(err)
        }
    },
    updateSubjectToProgram: async (req, res, next) => {
        try {
            const programSubjectId = req.params.programSubjectId
            const data = await programService.updateSubjectToProgram(programSubjectId, req.body)
            const response = responseSuccess(data, "Cập nhật môn học chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật môn học chương trình thất bại", err)
            next(err)
        }
    },
    addCertificateToProgram: async (req, res, next) => {
        try {
            const programId = req.params.programId
            await programService.addCertificateToProgram(programId, req.body)
            const response = responseSuccess("Gán chứng chỉ vào chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Gán chứng chỉ vào chương trình thất bại", err)
            next(err)
        }
    },
    updateCertificateToProgram: async (req, res, next) => {
        try {
            const programCertificateId = req.params.programCertificateId
            const data = await programService.updateCertificateToProgram(programCertificateId, req.body)
            const response = responseSuccess(data, "Cập nhật chứng chỉ chương trình thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật chứng chỉ chương trình thất bại", err)
            next(err)
        }
    },
    getSemesterOrdersPrgram: async (req, res, next) => {
        try {
            const programId = req.params.programId
            const data = await programService.getSemesterOrdersPrgram(programId)
            const response = responseSuccess(data, 'Lấy danh sách học kì của chương trình này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học kì của chương trình này thất bại", err)
            next(err)
        }
    },
    getSubjectsBySemesterOrder: async (req, res, next) => {
        try {
            const programId = req.params.programId
            const semesterOrderId = req.params.semesterOrderId
            const data = await programService.getSubjectsBySemesterOrder(programId,semesterOrderId)
            const response = responseSuccess(data, 'Lấy danh sách môn học theo học kì của chương trình này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách môn học theo học kì của chương trình này thất bại", err)
            next(err)
        }
    },


}