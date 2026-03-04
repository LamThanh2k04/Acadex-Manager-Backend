import { responseSuccess } from "../../common/helpers/response.helper.js"
import { courseSectionSecvice } from "../../services/lecturer/courseSectionSecvice.js"

export const courseSectionController = {
    getAllSemestersSimple: async (req, res, next) => {
        try {
            const data = await courseSectionSecvice.getAllSemestersSimple()
            const response = responseSuccess(data, 'Lấy danh sách học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học kì thực tế thất bại", err)
            next(err)
        }
    },
    getSubjectsBySemester: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const semesterId = req.params.semesterId
            const data = await courseSectionSecvice.getSubjectsBySemester(lecturerId, semesterId)
            const response = responseSuccess(data, 'Lấy danh sách môn học trong học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách môn học trong học kì thực tế thất bại", err)
            next(err)
        }
    },
    getAllCourseSectionsBySubject: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const subjectId = req.params.subjectId
            const data = await courseSectionSecvice.getAllCourseSectionsBySubject(lecturerId, subjectId)
            const response = responseSuccess(data, 'Lấy danh sách học phần của môn học mà giảng viên này dạy trong học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học phần của môn học mà giảng viên này dạy trong học kì thực tế thất bại", err)
            next(err)
        }
    },
    getAllStudentEnrollmentIsPaid: async (req, res, next) => {
        try {
            const page = req.query.page || 1
            const search = req.query.search || ""
            const courseSectionId = req.params.courseSectionId
            const data = await courseSectionSecvice.getAllStudentEnrollmentIsPaid(courseSectionId, search,page)
            const response = responseSuccess(data, 'Lấy danh sách sinh viên học phần của môn học mà giảng viên này dạy trong học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách sinh viên học phần của môn học mà giảng viên này dạy trong học kì thực tế thất bại", err)
            next(err)
        }
    },
    getAllCourseSectionLecturer: async (req, res, next) => {
        try {
            const lecturerId = req.user.id
            const page = req.query.page || 1
            const search = req.query.search || ""
            const semesterId = req.query.semesterId
            const data = await courseSectionSecvice.getAllCourseSectionLecturer(lecturerId,semesterId, search,page)
            const response = responseSuccess(data, 'Lấy danh sách học phần của môn học mà giảng viên này dạy trong học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học phần của môn học mà giảng viên này dạy trong học kì thực tế thất bại", err)
            next(err)
        }
    },
}