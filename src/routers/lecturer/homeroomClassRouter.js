import expres from 'express'
import { homeroomClassController } from '../../controllers/lecturer/homeroomClassController.js'

const router = expres.Router()

router.get('/getAllStudents',homeroomClassController.getAllStudents)

export default router