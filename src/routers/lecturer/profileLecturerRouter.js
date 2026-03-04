import express from 'express'
import { profileLecturerController } from '../../controllers/lecturer/profileLecturerController.js'

const router = express.Router()

router.get('/getInfoLecturer',profileLecturerController.getInfoLecturer)

export default router