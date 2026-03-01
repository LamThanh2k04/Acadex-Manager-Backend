import { responseSuccess } from "../../common/helpers/response.helper.js"
import { paymentSecvice } from "../../services/student/paymentSevice.js"

export const paymentController = {
    getUnpaidEnrollments: async (req, res, next) => {
        try {
            const studentId = req.user.id
            console.log(studentId)
            const data = await paymentSecvice.getUnpaidEnrollments(studentId)
            const response = responseSuccess(data, 'Lấy danh sách học phần đã đăng kí chưa thanh toán thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách học phần đã đăng kí chưa thanh toán thất bại', err)
            next(err)
        }
    },
    createPayment: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await paymentSecvice.createPayment(studentId, req.body)
            const response = responseSuccess(data, 'Tạo phiên thanh toán vnpay thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Tạo phiên thanh toán vnpay thất bại', err)
            next(err)
        }
    },
    vnpayReturn: async (req, res, next) => {
        try {
            const data = await paymentSecvice.vnpayReturn(req.query)
            const response = responseSuccess(data, 'Xác nhận phiên thanh toán vnpay thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Xác nhận phiên thanh toán vnpay thất bại', err)
            next(err)
        }
    },
    getAllEnrollmentIsPaid: async (req, res, next) => {
        try {
            const semesterId = req.query.semesterId
            const studentId = req.user.id
            const data = await paymentSecvice.getAllEnrollmentIsPaid(studentId, semesterId)
            const response = responseSuccess(data, 'Lấy danh sách môn đã đóng tiền thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy danh sách môn đã đóng tiền thất bại', err)
            next(err)
        }
    }
}