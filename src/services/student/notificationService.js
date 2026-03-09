import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const notificationService = {
    getAllNotifications : async (studentId) => {
        const student = await prisma.user.findUnique({
            where : {
                id : Number(studentId)
            }
        })
        if(!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const notifications = await prisma.notificationTarget.findMany({
            where : {
                userId : studentId
            },
            select : {
                isRead : true,
                readAt : true,
                notification: {
                    select : {
                        title : true,
                        message : true,
                        type : true,
                        targetRole : true
                    }
                }
            },
            orderBy : {
                notification : {
                    createdAt : 'desc'
                }
            }
        })
        const countNotificationUnRead = await prisma.notificationTarget.count({
            where : {
                isRead : false,
                userId  : studentId
            }
        })
        return {
            notifications,
            countNotificationUnRead
        }
    }
}