import express from 'express'
import { paymentController } from '../../controllers/student/paymetController.js'

const router = express.Router()

router.get('/getUnpaidEnrollments',paymentController.getUnpaidEnrollments)
router.post('/createPayment',paymentController.createPayment)
router.get('/vnpayReturn',paymentController.vnpayReturn)
router.get('/getAllEnrollmentIsPaid',paymentController.getAllEnrollmentIsPaid)
export default router