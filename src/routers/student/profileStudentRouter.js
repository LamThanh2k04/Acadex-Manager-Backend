import express from 'express'
import { profileStudentController } from '../../controllers/student/profileStudentController.js'

const router = express.Router()

router.get('/getInfoStudent',profileStudentController.getInfoStudent)

export default router