import { responseSuccess } from "../../common/helpers/response.helper.js"
import { curriculumFrameworkService } from "../../services/student/curriculumFrameworkService.js"

export const curriculumFrameworkController = {
    getSemesterOrderProgram: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await curriculumFrameworkService.getSemesterOrderProgram(studentId)
            const response = responseSuccess(data, 'Lấy các kì của chương trình sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy các kì của chương trình sinh viên này thất bại', err)
            next(err)
        }
    },
    getSubjectsBySemesterOrderProgram : async (req,res,next) => {
        try {
            const studentId = req.user.id
            const semesterOrder = req.params.semesterOrder
            const data = await curriculumFrameworkService.getSubjectsBySemesterOrderProgram(studentId,semesterOrder)
            const response = responseSuccess(data, 'Lấy các môn của học kì của chương trình sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy các môn của học kì của chương trình sinh viên này thất bại', err)
            next(err)
        }
    }
}