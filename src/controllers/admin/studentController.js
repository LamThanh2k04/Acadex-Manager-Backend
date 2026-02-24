import { responseSuccess } from "../../common/helpers/response.helper.js";
import { studentService } from "../../services/admin/studentService.js"

export const studentController = {
    createStudent: async (req, res, next) => {
        try {
            const avatarPath = req.file?.path;
            const data = await studentService.createStudent(req.body, avatarPath)
            const response = responseSuccess(data, "Tạo sinh viên thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo sinh viên thất bại", err)
            next(err)
        }
    },
    updateStudentInfo: async (req, res, next) => {
        try {
            const studentId = req.params.studentId
            const avatarPath = req.file?.path;
            const data = await studentService.updateStudentInfo(studentId,req.body, avatarPath)
            const response = responseSuccess(data, "Cập nhật thông tin sinh viên thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin sinh viên thất bại", err)
            next(err)
        }
    },
    updateStudentStatusActive: async (req, res, next) => {
         try {
            const studentId = req.params.studentId
            const data = await studentService.updateStudentStatusActive(studentId)
            const response = responseSuccess(data, "Cập nhật trạng thái sinh viên thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái sinh viên thất bại", err)
            next(err)
        }
    },
    getAllStudents: async (req, res, next) => {
        try {
            const {studentCode, studentName, programName, majorName, facultyName,className} = req.query
            const page = req.query.page || 1
            const data = await studentService.getAllStudents(studentCode, studentName, programName, majorName, facultyName,className, page)
            const response = responseSuccess(data, "Lấy danh sách sinh viên có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách sinh viên có phân trang thất bại", err)
            next(err)
        }
    },
    resetPasswordStudent: async (req, res, next) => {
        try {
            const studentId = req.params.studentId
            const data = await studentService.resetPasswordStudent(studentId,req.body)
            const response = responseSuccess(data, "Đặt lại mật khẩu sinh viên thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Đặt lại mật khẩu sinh viên thất bại", err)
            next(err)
        }
    },

}