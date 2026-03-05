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
            const search = req.query.search
            const page = req.query.page || 1
            const data = await lecturerService.getAllLecturers(search, page)
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
    getAllRequestPauseLecturers: async (req, res, next) => {
        try {
            const status = req.query.status
            const page = req.query.page || 1
            const data = await lecturerService.getAllRequestPauseLecturers(status, page)
            const response = responseSuccess(data, 'Lấy danh sách yêu cầu tạm dừng giảng dạy có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách yêu cầu tạm dừng giảng dạy có phân trang thất bại', err)
            next(err)
        }
    },
    getInfoPauseLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const data = await lecturerService.getInfoPauseLecturer(requestLecturerId)
            const response = responseSuccess(data, 'Lấy thông tin yêu cầu tạm dừng giảng dạy của giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin yêu cầu tạm dừng giảng dạy của giảng viên thất bại', err)
            next(err)
        }
    },
    approveRequestPauseLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const adminId = req.user.id
            const data = await lecturerService.approveRequestPauseLecturer(requestLecturerId, adminId, req.body)
            const response = responseSuccess(data, 'Duyệt yêu cầu tạm dừng giảng dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Duyệt yêu cầu tạm dừng giảng dạy thất bại', err)
            next(err)
        }
    },
    rejectRequestPauseLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const adminId = req.user.id
            const data = await lecturerService.rejectRequestPauseLecturer(requestLecturerId, adminId, req.body)
            const response = responseSuccess(data, 'Từ chối yêu cầu tạm dừng giảng dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Từ chối yêu cầu tạm dừng giảng dạy thất bại', err)
            next(err)
        }
    },
    getAllRequestChangeGradeLecturers: async (req, res, next) => {
        try {
            const status = req.query.status
            const page = req.query.page || 1
            const data = await lecturerService.getAllRequestChangeGradeLecturers(status, page)
            const response = responseSuccess(data, 'Lấy danh sách yêu cầu thay đổi điểm giảng dạy có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách yêu cầu thay đổi điểm giảng dạy có phân trang thất bại', err)
            next(err)
        }
    },
    getInfoRequestChangeGradeLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const data = await lecturerService.getInfoRequestChangeGradeLecturer(requestLecturerId)
            const response = responseSuccess(data, 'Lấy thông tin yêu cầu thay đổi điểm giảng dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin yêu cầu thay đổi điểm giảng dạy thất bại', err)
            next(err)
        }
    },
    approveRequestChangeGradeLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const adminId = req.user.id
            const data = await lecturerService.approveRequestChangeGradeLecturer(requestLecturerId, adminId, req.body)
            const response = responseSuccess(data, 'Duyệt yêu cầu thay đổi điểm giảng dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Duyệt yêu cầu thay đổi điểm giảng dạy thất bại', err)
            next(err)
        }
    },
    rejectRequestChangeGradeLecturer: async (req, res, next) => {
        try {
            const requestLecturerId = req.params.requestLecturerId
            const adminId = req.user.id
            const data = await lecturerService.rejectRequestChangeGradeLecturer(requestLecturerId, adminId, req.body)
            const response = responseSuccess(data, 'Từ chối yêu cầu thay đổi điểm giảng dạy thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Từ chối yêu cầu thay đổi điểm giảng dạy thất bại', err)
            next(err)
        }
    },
    getOverViewLecturer: async (req, res, next) => {
        try {
            const data = await lecturerService.getOverViewLecturer()
            const response = responseSuccess(data, 'Lấy tổng quan giảng viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy tổng quan giảng viên thất bại', err)
            next(err)
        }
    },
    getAvailableHomeroomLecturers: async (req, res, next) => {
        try {
            const majorId = req.params.majorId
            const data = await lecturerService.getAvailableHomeroomLecturers(majorId)
            const response = responseSuccess(data, 'Lấy giảng viên chưa có lớp chủ nhiệm thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy giảng viên chưa có lớp chủ nhiệm thất bại', err)
            next(err)
        }
    }

}