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
            const data = await notificationService.sendNotification(adminId,req.body)
            const response = responseSuccess(data, 'Gửi thông báo thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Gửi thông báo thất bại', err)
            next(err)
        }
    },
    updateNotification: async (req, res, next) => {
        try {
            const notificationId = req.params.notificationId
            const data = await notificationService.updateNotification(notificationId,req.body)
            const response = responseSuccess(data, 'Cập nhật thông báo thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Cập nhật thông báo thất bại', err)
            next(err)
        }
    },
    getAllNotifications: async (req, res, next) => {
        try {
            const search = req.query.search || ""
            const page = req.query.page || 1
            const data = await notificationService.getAllNotifications(search, page)
            const response = responseSuccess(data, 'Lấy danh sách thông báo có phân trang thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách thông báo có phân trang thất bại', err)
            next(err)
        }
    },
    removeNotification: async (req,res,next) => {
        try {
             const notificationId = req.params.notificationId
             await notificationService.removeNotification(notificationId) 
             const response = responseSuccess(null, 'Xóa thông báo thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xóa thông báo thất bại', err)
            next(err)
        }
        
}
}