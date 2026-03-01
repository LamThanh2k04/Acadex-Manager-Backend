import { responseSuccess } from "../../common/helpers/response.helper.js"
import { courseSectionSecvice } from "../../services/student/courseSectionService.js"

export const courseSectionController = {
    getAllSemesters: async (req, res, next) => {
        try {
            const data = await courseSectionSecvice.getAllSemesters()
            const response = responseSuccess(data, 'Lấy học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy học kì thực tế thất bại', err)
            next(err)
        }
    },
    getSubjectsBySemester: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const semesterId = req.params.semesterId
            const data = await courseSectionSecvice.getSubjectsBySemester(studentId, semesterId)
            const response = responseSuccess(data, 'Lấy môn học của học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy môn học của học kì thực tế thất bại', err)
            next(err)
        }
    },
    getCourseSectionsBySubject: async (req, res, next) => {
        try {
            const { semesterId, subjectId } = req.params
            const data = await courseSectionSecvice.getCourseSectionsBySubject(semesterId, subjectId)
            const response = responseSuccess(data, 'Lấy các học phần của môn học của học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy các học phần của môn học của học kì thực tế thất bại', err)
            next(err)
        }
    },
    getScheduleByCourseSection: async (req, res, next) => {
        try {
            const courseSectionId = req.params.courseSectionId
            const data = await courseSectionSecvice.getScheduleByCourseSection(courseSectionId)
            const response = responseSuccess(data, 'Lấy lịch học phần của môn học của học kì thực tế thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy lịch học phần của môn học của học kì thực tế thất bại', err)
            next(err)
        }
    },
    registerCourseSection: async (req, res, next) => {
        try {
            const studentId = req.user.id
            await courseSectionSecvice.registerCourseSection(studentId, req.body)
            const response = responseSuccess(null, "Đăng kí học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Đăng kí học phần thất bại', err)
            next(err)
        }
    },
    cancelCourseSection: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const enrollmentId = req.params.enrollmentId
            await courseSectionSecvice.cancelCourseSection(studentId, enrollmentId)
            const response = responseSuccess(null, "Hủy học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Hủy học phần thất bại', err)
            next(err)
        }
    },
    getAllEnrollmentCourseSection: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await courseSectionSecvice.getAllEnrollmentCourseSection(studentId)
            const response = responseSuccess(data, "Lấy danh sách học phần đã đăng kí thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học phần đã đăng kí thất bại', err)
            next(err)
        }
    },
}