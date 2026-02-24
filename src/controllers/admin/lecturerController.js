import { responseSuccess } from "../../common/helpers/response.helper.js";
import { lecturerService } from "../../services/admin/lecturerService.js";

export const lecturerController = {
    createLecturer: async (req, res, next) => {
        try {
            const avatarPath = req.file?.path;
            const data = await lecturerService.createLecturer(req.body, avatarPath)
            const response = responseSuccess(data, 'Tạo giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo giảng viên thất bại', err)
            next(err)
        }
    },
    updateLecturerInfo: async (req, res, next) => {
        try {
            const lecturerId = req.params.lecturerId
            const avatarPath = req.file?.path;
            const data = await lecturerService.updateLecturerInfo(lecturerId, req.body, avatarPath)
            const response = responseSuccess(data, 'Cập nhật thông tin giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông tin giảng viên thất bại', err)
            next(err)
        }
    },
    updateLecturerStatusActive: async (req, res, next) => {
        try {
            const lecturerId = req.params.lecturerId
            const data = await lecturerService.updateLecturerStatusActive(lecturerId)
            const response = responseSuccess(data, 'Cập nhật trạng thái giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái giảng viên thất bại', err)
            next(err)
        }
    },
    getAllLecturers: async (req, res, next) => {
        try {
            const { lecturerCode, lecturerName, majorName,facultyName } = req.query
            const page = req.query.page || 1
            const data = await lecturerService.getAllLecturers(lecturerCode, lecturerName, majorName,facultyName, page)
            const response = responseSuccess(data, 'Lấy danh sách giảng viên có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách giảng viên có phân trang thất bại', err)
            next(err)
        }
    },
    getAllLecturersSimple: async (req, res, next) => {
        try {
            const data = await lecturerService.getAllLecturersSimple()
            const response = responseSuccess(data, 'Lấy danh sách giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách giảng viên thất bại', err)
            next(err)
        }
    },
    resetPasswordLecturer: async (req, res, next) => {
        try {
            const lecturerId = req.params.lecturerId
            const data = await lecturerService.resetPasswordLecturer(lecturerId, req.body)
            const response = responseSuccess(data, 'Đặt lại mật khẩu giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đặt lại mật khẩu giảng viên thất bại', err)
            next(err)
        }
    },
    getlecturersByFaculty: async (req, res, next) => {
        try {
            const facultyId = req.params.facultyId
            const data = await lecturerService.getlecturersByFaculty(facultyId)
            const response = responseSuccess(data, 'Lấy danh sách giảng viên theo khoa thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách giảng viên theo khoa thất bại', err)
            next(err)
        }
    },
}