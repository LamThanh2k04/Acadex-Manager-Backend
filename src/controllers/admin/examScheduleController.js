import { responseSuccess } from "../../common/helpers/response.helper.js"
import { examScheduleService } from "../../services/admin/examScheduleService.js"

export const examScheduleController = {
    getAvailableRooms: async (req, res, next) => {
        try {
            const { date, startMinute, endMinute } = req.query
            const data = await examScheduleService.getAvailableRooms(date, startMinute, endMinute)
            const response = responseSuccess(data, "Lấy danh sách phòng thi trống thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách phòng thi trống thất bại", err)
            next(err)
        }
    },
    getCourseSectionHaveSchedule: async (req, res, next) => {
        try {
            const semesterId = req.query.semesterId
            const data = await examScheduleService.getCourseSectionHaveSchedule(semesterId)
            const response = responseSuccess(data, "Lấy danh sách học phần có lịch học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách học phần có lịch học thất bại", err)
            next(err)
        }
    },
    suggestExamSchedule: async (req, res, next) => {
        try {
            const courseSectionId = req.query.courseSectionId
            const data = await examScheduleService.suggestExamSchedule(courseSectionId)
            const response = responseSuccess(data, "Đề xuất lịch thi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Đề xuất lịch thi thất bại", err)
            next(err)
        }
    },
    createExamSchedule: async (req, res, next) => {
        try {
            const data = await examScheduleService.createExamSchedule(req.body)
            const response = responseSuccess(data, "Tạo lịch thi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Tạo lịch thi thất bại", err)
            next(err)
        }
    },
    updateExamScheduleInfo: async (req, res, next) => {
        try {
            const examScheduleId = req.params.examScheduleId
            const data = await examScheduleService.updateExamScheduleInfo(examScheduleId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin lịch thi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin lịch thi thất bại", err)
            next(err)
        }
    },
    updateExamScheduleStatus: async (req, res, next) => {
        try {
            const examScheduleId = req.params.examScheduleId
            const data = await examScheduleService.updateExamScheduleStatus(examScheduleId)
            const response = responseSuccess(data, "Cập nhật trạng thái lịch thi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái lịch thi thất bại", err)
            next(err)
        }
    },
    getAllExamSchedules: async (req, res, next) => {
        try {
            const { courseSectionCode, roomName } = req.query
            const page = req.query.page || 1
            const data = await examScheduleService.getAllExamSchedules(courseSectionCode, roomName, page)
            const response = responseSuccess(data, "Lấy tất cả lịch thi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy tất cả lịch thi thất bại", err)
            next(err)
        }
    }

}