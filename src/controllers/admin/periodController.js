import { responseSuccess } from "../../common/helpers/response.helper.js"
import { periodService } from "../../services/admin/periodService.js"

export const periodController = {
    createPeriod: async (req, res, next) => {
        try {
            const data = await periodService.createPeriod(req.body)
            const response = responseSuccess(data, "Cấu hình tiết học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cấu hình tiết học thất bại", err)
            next(err)
        }
    },
    updatePeriodInfo: async (req, res, next) => {
        try {
            const periodId = req.params.periodId
            const data = await periodService.updatePeriodInfo(periodId, req.body)
            const response = responseSuccess(data, "Cập nhật thông tin tiết học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật thông tin tiết học thất bại", err)
            next(err)
        }
    },
    updatePeriodStatus: async (req, res, next) => {
        try {
            const periodId = req.params.periodId
            const data = await periodService.updatePeriodStatus(periodId)
            const response = responseSuccess(data, "Cập nhật trạng thái tiết học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật trạng thái tiết học thất bại", err)
            next(err)
        }
    },
    getAllPeriods: async (req, res, next) => {
        try {
            const period = req.query.period
            const page = req.query.page || 1
            const data = await periodService.getAllPeriods(period, page)
            const response = responseSuccess(data, "Lấy danh sách tiết học có phân trang thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách tiết học có phân trang thất bại", err)
            next(err)
        }
    },
    getAllPeriodsSimple: async (req, res, next) => {
        try {
            const data = await periodService.getAllPeriods(period, page)
            const response = responseSuccess(data, "Lấy danh sách tiết học thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách tiết học thất bại", err)
            next(err)
        }
    }
}