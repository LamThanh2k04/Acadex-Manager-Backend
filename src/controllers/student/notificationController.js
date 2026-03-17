import { responseSuccess } from "../../common/helpers/response.helper.js"
import { notificationService } from "../../services/student/notificationService.js"

export const notificationController = {
    getAllNotifications : async (req,res,next) => {
        try {
            const studentId = req.user.id
            const data = await notificationService.getAllNotifications(studentId)
            const response = responseSuccess(data,'Lấy danh sách thông báo sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách thông báo sinh viên này thất bại',err)
            next(err)
        }
    },
     getInfoNotification : async (req,res,next) => {
        try {
            const studentId = req.user.id
            const notificationId = req.params.notificationId
            const data = await notificationService.getInfoNotification(notificationId,studentId)
            const response = responseSuccess(data,'Lấy thông tin thông báo của sinh viên thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy thông tin thông báo của sinh viên thất bại',err)
            next(err)
        }
    }
}