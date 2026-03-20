import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateAttendanceCode from "../../common/helpers/generateAttendanceCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import { getIO } from "../../socket/socket.js"

const rotationMap = new Map()
const startRotateCode = (sessionId) => {
    const io = getIO()

    const interval = setInterval(async () => {
        const newCode = generateAttendanceCode()
        const now = new Date()

        await prisma.attendanceSession.update({
            where: { id: Number(sessionId) },
            data: {
                currentCode: newCode,
                codeExpiresAt: new Date(now.getTime() + 60000)
            }
        })

        io.to(`attendance_${sessionId}`).emit("code-updated", {
            code: newCode
        })

    }, 60000)

    rotationMap.set(sessionId, interval)
}

export const attendanceService = {
    getAllSchedulesLecturer: async (lecturerId, date) => {
        const getDayOfWeek = (date) => {
            const jsDay = new Date(date).getDay()
            return jsDay === 0 ? 8 : jsDay + 1
        }
        const lecturer = await prisma.lecturer.findUnique({
            where: {
                userId: lecturerId
            }
        })
        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }
        const targetDate = new Date(date)
        const dayOfWeek = getDayOfWeek(date)

        const schedules = await prisma.schedule.findMany({
            where: {
                courseSection: {
                    lecturerId: lecturer.id
                },
                startDate: { lte: targetDate },
                endDate: { gte: targetDate },
                dayOfWeek: dayOfWeek,
                isActive: true,
                isPaused: false
            },
            include: {
                room: true,
                courseSection: {
                    include: {
                        subject: true,
                        semester: true,
                        plannedClass: true
                    }
                }
            },
            orderBy: {
                startTimeMinutes: 'asc'
            }
        })
        return {
            schedules,
            date
        }
    },
    getStudentsOfSchedule: async (scheduleId, date, search) => {
        const schedule = await prisma.schedule.findUnique({
            where: { id: Number(scheduleId) },
            select: { courseSectionId: true }
        })

        const start = new Date(date)
        start.setHours(0, 0, 0, 0)

        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        const session = await prisma.attendanceSession.findFirst({
            where: {
                scheduleId: Number(scheduleId),
                sessionDate: { gte: start, lte: end }
            },
            include: { attendances: true }
        })


        const attendanceMap = new Map()

        session?.attendances.forEach(a => {
            attendanceMap.set(a.studentId, {
                attendanceId: a.id,
                status: a.status
            })
        })


        const enrollments = await prisma.enrollment.findMany({
            where: {
                courseSectionId: schedule.courseSectionId,
                status: "REGISTERED",

                ...(search && {
                    student: {
                        is: {
                            OR: [
                                { studentCode: { equals: search } },
                                {
                                    user: {
                                        fullName: { contains: search }
                                    }
                                }
                            ]
                        }
                    }
                })
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        })


        const students = enrollments.map(e => {
            const record = attendanceMap.get(e.student.id)

            return {
                avatarStudent: e.student.user.avatar,
                studentCode: e.student.studentCode,
                fullName: e.student.user.fullName,
                attendanceId: record?.attendanceId ?? null,
                attendanceStatus: record?.status ?? null
            }
        })

        return {
            totalStudents: students.length,
            students
        }
    },
    startAttendance: async (lecturerId, data) => {
        const { scheduleId } = data
        const now = new Date()
        const code = generateAttendanceCode()

        const [schedule, lecturer] = await Promise.all([
            prisma.schedule.findUnique({
                where: { id: Number(scheduleId) }
            }),
            prisma.lecturer.findUnique({
                where: { userId: Number(lecturerId) }
            })
        ])

        if (!schedule) {
            throw new NotFoundException('Không tìm thấy lịch này')
        }

        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }

        const session = await prisma.attendanceSession.create({
            data: {
                sessionDate: now,
                startedAt: now,

                currentCode: code,
                codeExpiresAt: new Date(now.getTime() + 60000),
                isTaking: true,

                scheduleId: Number(scheduleId),
                lecturerId: lecturer.id
            }
        })


        getIO().to(`attendance_${session.id}`).emit("code-updated", {
            code: code
        })

        startRotateCode(session.id)

        return session
    },
    stopAttendance: async (sessionId) => {
        const interval = rotationMap.get(sessionId)

        if (interval) {
            clearInterval(interval)
            rotationMap.delete(sessionId)
        }

        await prisma.attendanceSession.update({
            where: { id: Number(sessionId) },
            data: {
                endedAt: new Date(),
                isTaking: false,
                currentCode: null,
                codeExpiresAt: null
            }
        })

        getIO().to(`attendance_${sessionId}`).emit("attendance-ended")
    },
    sendAttendanceReport: async (sessionId, data) => {
        const { note } = data
        const session = await prisma.attendanceSession.findUnique({
            where: { id: Number(sessionId) },
            include: { attendances: true }
        })
        if (!session) {
            throw new NotFoundException('Không tìm thấy buổi điểm danh')
        }


        if (session.isTaking) {
            throw new BadrequestException('Chưa thể gửi báo cáo khi buổi điểm danh chưa kết thúc')
        }


        if (session.attendances.length === 0) {
            throw new BadrequestException('Chưa có dữ liệu điểm danh để gửi báo cáo')
        }
        if (session.sentToAdmin) {
            throw new BadrequestException('Báo cáo đã được gửi trước đó')
        }
        const sendSession = await prisma.attendanceSession.update({
            where: { id: Number(sessionId) },
            data: {
                note,
                sentToAdmin: true
            },
            include: {
                attendances: {
                    include: {
                        student: {
                            include: {
                                user: true
                            }
                        }

                    }
                }
            }
        })

        return sendSession
    },
    updateAttendanceStatus: async (attendanceId, data) => {
        const { status } = data
        const attendance = await prisma.attendance.findUnique({
            where: { id: Number(attendanceId) }
        })
        if (!attendance) {
            throw new NotFoundException('Không tìm thấy phần điểm danh của học sinh này')
        }
        const updateAttendanceStatus = await prisma.attendance.update({
            where: { id: Number(attendanceId) },
            data: {
                status: status
            }
        })
        getIO().to(`attendance_${attendance.sessionId}`).emit("attendance-updated", {
            studentId: attendance.studentId,
            status
        })
        return updateAttendanceStatus
    }
}