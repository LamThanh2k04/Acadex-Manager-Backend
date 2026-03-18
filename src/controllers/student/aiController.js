import { responseSuccess } from "../../common/helpers/response.helper.js"
import { aiService } from "../../services/student/aiService.js"


export const aiController = {
    aiMessage: async function (req, res, next) {
        try {
            const user = req.user
            const data = await aiService.aiMessage(user, req.body)
            const reponse = responseSuccess(data, "Trả lời thành công")
            res.status(reponse.status).json(reponse)
        } catch (err) {
            console.error("Trả lời thất bại", err)
            next(err)
        }
    }
}