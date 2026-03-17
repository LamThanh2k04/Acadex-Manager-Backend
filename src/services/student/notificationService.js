import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const notificationService = {
    getAllNotifications: async (studentId) => {
        const student = await prisma.user.findUnique({
            where: {
                id: Number(studentId)
            }
        })
        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên này")
        }
        const notifications = await prisma.notificationTarget.findMany({
            where: {
                userId: studentId
            },
            select: {
                isRead: true,
                readAt: true,
                notification: {
                    select: {
                        id: true,
                        title: true,
                        message: true,
                        type: true,
                        targetRole: true
                    }
                }
            },
            orderBy: {
                notification: {
                    createdAt: 'desc'
                }
            }
        })
        const countNotificationUnRead = await prisma.notificationTarget.count({
            where: {
                isRead: false,
                userId: studentId
            }
        })
        return {
            notifications,
            countNotificationUnRead
        }
    },
    getInfoNotification: async (notifcationId, studentId) => {
        const target = await prisma.notificationTarget.findFirst({
            where: {
                notificationId: Number(notifcationId),
                userId: studentId
            },
            select: {
                id: true,
                isRead: true,
                readAt: true,
                notification: {
                    select: {
                        id: true,
                        title: true,
                        message: true,
                        type: true,
                        targetRole: true
                    }
                }
            }
        })
        if (!target) {
            throw new NotFoundException('Không tìm thấy thông báo này')
        }
        if (!target.isRead) {
            await prisma.notificationTarget.update({
                where: {
                    id: target.id
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            })

        }
        return {
            target
        }
    }
}