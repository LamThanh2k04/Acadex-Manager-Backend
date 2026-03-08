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

        // nếu không truyền userIds -> gửi toàn bộ student
        if (!receivers || receivers.length === 0) {

            const students = await prisma.student.findMany({
                select: {
                    userId: true
                }
            })

            receivers = students.map(s => s.userId)
        }

        // tạo notification
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: receivers.length === 1 ? "PERSONAL" : "BROADCAST",
                adminId
            }
        })

        // tạo target
        const targets = receivers.map(id => ({
            notificationId: notification.id,
            userId: id
        }))

        await prisma.notificationTarget.createMany({
            data: targets
        })

        // socket realtime
        receivers.forEach(id => {

            io.to(`user_${id}`).emit("notification", {
                id: notification.id,
                title,
                message
            })

        })

        return notification
    }
}
