import { responseSuccess } from "../../common/helpers/response.helper.js"
import { gradesResultsService } from "../../services/student/gradesResultsService.js"

export const gradesResultsController = {
    getDetailedStudyResults: async (req, res, next) => {
        try {
            const studentId = req.user.id
            const data = await gradesResultsService.getDetailedStudyResults(studentId)
            const response = responseSuccess(data, 'Lấy kết quả điểm của sinh viên này thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error('Lấy kết quả điểm của sinh viên này thất bại', err)
            next(err)
        }
    }
}