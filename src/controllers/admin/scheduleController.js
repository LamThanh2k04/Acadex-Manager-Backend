import { responseSuccess } from "../../common/helpers/response.helper.js"
import { scheduleService } from "../../services/admin/scheduleService.js"

export const scheduleController = {
    createSchedule: async (req, res, next) => {
        try {
            const data = await scheduleService.createSchedule(req.body)
            const response = responseSuccess(data, "Tạo lịch của học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo lịch của học phần thất bại', err)
            next(err)
        }
    },
    updateScheduleInfo: async (req, res, next) => {
        try {
            const scheduleId = req.params.scheduleId
            const data = await scheduleService.updateScheduleInfo(scheduleId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin lịch của học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông tin lịch của học phần thất bại', err)
            next(err)
        }
    },
    updateScheduleStatus: async (req, res, next) => {
        try {
            const scheduleId = req.params.scheduleId
            const data = await scheduleService.updateScheduleStatus(scheduleId)
            const response = responseSuccess(data, "Cập nhật trạng thái lịch của học phần thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật trạng thái lịch của học phần thất bại', err)
            next(err)
        }
    },
    getAllSchedules: async (req, res, next) => {
        try {
            const { courseSectionCode, type } = req.query
            const semesterId = req.query.semesterId
            const dayOfweek = req.query.dayOfweek
            const page = req.query.page || 1
            const data = await scheduleService.getAllSchedules(courseSectionCode, type, semesterId, dayOfweek, page)
            const response = responseSuccess(data, "Lấy danh sách lịch của học phần có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error('ấy danh sách lịch của học phần có phân trang thất bại', err)
            next(err)
        }
    }
}