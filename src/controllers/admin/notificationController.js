import { responseSuccess } from "../../common/helpers/response.helper.js"
import { notificationService } from "../../services/admin/notificationService.js"

export const notificationController = {
    getStudentsBySearch: async (req, res, next) => {
        try {
            const search = req.query.search
            const data = await notificationService.getStudentsBySearch(search)
            const response = responseSuccess(data, 'Lấy các học sinh theo tìm kiếm thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy các học sinh theo tìm kiếm thất bại', err)
            next(err)
        }
    },
    sendNotification: async (req, res, next) => {
        try {
            const adminId = req.user.id
            const data = await notificationService.sendNotification(req.body, adminId)
            const response = responseSuccess(data, 'Gửi thông báo thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Gửi thông báo thất bại', err)
            next(err)
        }
    }
}