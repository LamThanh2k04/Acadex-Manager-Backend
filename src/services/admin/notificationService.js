import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import { getIO } from "../../socket/socket.js"

export const notificationService = {
    getStudentsBySearch: async (search) => {
        const whereCondition = {
            role: 'STUDENT',
            ...(search ? {
                OR: [
                    {
                        fullName: {
                            contains: search.toLowerCase()
                        }
                    },
                    {
                        student: {
                            studentCode: {
                                contains: search.toLowerCase()
                            }
                        }
                    }
                ]
            } : {})
        }
        const students = await prisma.user.findMany({
            where: whereCondition,
            select: {
                id: true,
                fullName: true,
                student: {
                    select: {
                        studentCode: true
                    }
                }
            }

        })
        return {
            students
        }
    },
    sendNotification: async (adminId, data) => {
        const { title, message, userIds } = data
        const io = getIO()

        let receivers = userIds


        if (!receivers || receivers.length === 0) {

            const students = await prisma.student.findMany({
                select: {
                    userId: true
                }
            })

            receivers = students.map(s => s.userId)
        }

        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: receivers.length === 1 ? "PERSONAL" : "BROADCAST",
                senderId: adminId
            }
        })


        const targets = receivers.map(id => ({
            notificationId: notification.id,
            userId: id
        }))

        await prisma.notificationTarget.createMany({
            data: targets
        })

        receivers.forEach(id => {

            io.to(`user_${id}`).emit("notification", {
                id: notification.id,
                title,
                message
            })

        })

        return notification
    },
    getAllNotifications: async (search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(search ? {
                title: {
                    contains: search.toLowerCase()
                }
            } : {})
        }
        const [notifications, totalNotifications] = await Promise.all([
            prisma.notification.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({
                where: whereCondition
            })
        ])
        return {
            notifications,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalNotifications,
                totalPages: Math.ceil(totalNotifications / limit)

            }
        }
    },
    updateNotification: async (notificationId, data) => {
        const { title, message } = data
        const updateData = {}
        if (title !== undefined) updateData.title = title.trim()
        if (message !== undefined) updateData.message = message.trim()

        const notification = await prisma.notification.findUnique({
            where: { id: Number(notificationId) }
        })
        if (!notification) {
            throw new NotFoundException('Không tìm thấy thông báo này')
        }
        const updateNotification = await prisma.notification.update({
            where: { id: Number(notificationId) },
            data: updateData
        })
        return {
            updateNotification
        }
    },
    removeNotification: async (notificationId) => {
        const notification = await prisma.notification.findUnique({
            where: { id: Number(notificationId) }
        })
        if (!notification) {
            throw new NotFoundException('Không tìm thấy thông báo này')
        }

        await prisma.$transaction([
            prisma.notificationTarget.deleteMany({
                where: { notificationId: Number(notificationId) }
            }),
            prisma.notification.delete({
                where: { id : Number(notificationId) }
            })
        ])
    }
}
