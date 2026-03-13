import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const attendanceService = {
    studentCheckIn: async (studentId, data) => {
        const { sessionId, code } = data
        const now = new Date()

        // ==============================
        // 1. Tìm sinh viên
        // ==============================
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }

        // ==============================
        // 2. Tìm buổi điểm danh
        // ==============================
        const session = await prisma.attendanceSession.findUnique({
            where: { id: Number(sessionId) }
        })

        if (!session || !session.isTaking) {
            throw new NotFoundException("Buổi điểm danh không tồn tại hoặc đã kết thúc")
        }

        // ==============================
        // 3. Check mã hợp lệ
        // ==============================
        if (!session.currentCode || session.currentCode !== code) {
            throw new BadrequestException("Mã điểm danh không đúng")
        }

        if (session.codeExpiresAt && now > session.codeExpiresAt) {
            throw new BadrequestException("Mã điểm danh đã hết hạn")
        }

        // ==============================
        // 4. Check đã điểm danh chưa
        // ==============================
        const existed = await prisma.attendance.findFirst({
            where: {
                sessionId: session.id,
                studentId: student.id
            }
        })

        if (existed) {
            throw new BadrequestException("Bạn đã điểm danh rồi")
        }

        // ==============================
        // 5. Lưu điểm danh
        // ==============================
        const attendance = await prisma.attendance.create({
            data: {
                sessionId: session.id,
                studentId: student.id,
                status: "PRESENT",
                checkedAt: now
            }
        })

        // ==============================
        // 6. Realtime báo cho giảng viên
        // ==============================
        getIO()
            .to(`attendance_${session.id}`)
            .emit("student-checked-in", {
                studentId: student.id,
                studentCode: student.studentCode
            })

        return attendance
    },
    getSchedulesStudent: async (studentId, date) => {
        const getDayOfWeek = (date) => {
            const jsDay = new Date(date).getDay()
            return jsDay === 0 ? 8 : jsDay + 1
        }

        // 1. Tìm sinh viên
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })
        if (!student) throw new NotFoundException("Không tìm thấy sinh viên")

        const targetDate = new Date(date)
        const dayOfWeek = getDayOfWeek(date)

        // 2. Lấy lịch học SV đã đăng ký
        const schedules = await prisma.schedule.findMany({
            where: {
                dayOfWeek,
                startDate: { lte: targetDate },
                endDate: { gte: targetDate },
                isActive: true,
                isPaused: false,
                courseSection: {
                    enrollments: {
                        some: {
                            studentId: student.id,
                            status: "REGISTERED"
                        }
                    }
                }
            },
            include: {
                room: {
                    include : {
                        building : true
                    }
                },
                
                courseSection: {
                    include: {
                        subject: true,
                        lecturer: {
                            include: { user: true }
                        }
                    }
                },
                attendanceSessions: {
                    where: {
                        sessionDate: {
                            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                            lte: new Date(new Date(date).setHours(23, 59, 59, 999))
                        }
                    },
                    select: {
                        id: true,
                        isTaking: true,
                        attendances : {
                            select : {
                                status : true
                            }
                        }
                        
                    }
                }
            },
            orderBy: { startTimeMinutes: 'asc' }
        })

        // 3. Format
        return schedules.map(s => ({
            scheduleId: s.id,
            subjectName: s.courseSection.subject.name,
            roomName: `${s.room.building.symbol}.${s.room.name}`,
            lecturerName: s.courseSection.lecturer.user.fullName,
            startTime: s.startTimeMinutes,
            endTime: s.endTimeMinutes,

            // 🔥 Quan trọng cho nút điểm danh
            sessionId: s.attendanceSessions[0]?.id ?? null,
            isTaking: s.attendanceSessions[0]?.isTaking ?? false
        }))
    },
    getAllSemestersSimple: async () => {
        const semesters = await prisma.semester.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                academicYear: true
            },
            orderBy: { id: 'asc' }
            

        })
        return {
            semesters
        }
    },
    getAbsentBySemester: async (studentUserId, semesterId) => {

        
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentUserId) }
        })

        if (!student) {
            throw new NotFoundException('Không tìm thấy sinh viên')
        }

      
        const periodSettings = await prisma.periodSetting.findMany({
            where: { isActive: true }
        })

        const countPeriods = (schedule) => {
            return periodSettings.filter(p =>
                p.startTimeMinutes >= schedule.startTimeMinutes &&
                p.endTimeMinutes <= schedule.endTimeMinutes
            ).length
        }

     
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'REGISTERED',
                courseSection: {
                    semesterId: Number(semesterId) 
                }
            },
            include: {
                courseSection: {
                    include: {
                        subject: true,
                        schedules: {
                            include: {
                                attendanceSessions: {
                                    include: {
                                        attendances: {
                                            where: { studentId: student.id }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

       
        const result = enrollments.map(e => {

            let excusedPeriods = 0
            let absentPeriods = 0

            e.courseSection.schedules.forEach(schedule => {
                const periodCount = countPeriods(schedule)

                schedule.attendanceSessions.forEach(session => {
                    session.attendances.forEach(a => {
                        if (a.status === 'EXCUSED') excusedPeriods += periodCount
                        if (a.status === 'ABSENT') absentPeriods += periodCount
                    })
                })
            })

            return {
                courseSectionId: e.courseSection.id,
                courseName: e.courseSection.subject.name,
                excusedPeriods,
                absentPeriods
            }
        })

        return result
    },
    getTotalabsent: async (studentUserId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentUserId) }
        })

        if (!student) {
            throw new NotFoundException('Không tìm thấy sinh viên')
        }
        const periodSettings = await prisma.periodSetting.findMany({
            where: { isActive: true }
        })

        const countPeriods = (schedule) => {
            return periodSettings.filter(p =>
                p.startTimeMinutes >= schedule.startTimeMinutes &&
                p.endTimeMinutes <= schedule.endTimeMinutes
            ).length
        }

     
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'REGISTERED',
            },
            include: {
                courseSection: {
                    include: {
                        subject: true,
                        schedules: {
                            include: {
                                attendanceSessions: {
                                    include: {
                                        attendances: {
                                            where: { studentId: student.id }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })


        const result = enrollments.reduce((acc, e) => {

            e.courseSection.schedules.forEach(schedule => {
                const periodCount = countPeriods(schedule)

                schedule.attendanceSessions.forEach(session => {
                    session.attendances.forEach(a => {
                        if (a.status === 'EXCUSED') acc.excusedPeriods += periodCount
                        if (a.status === 'ABSENT') acc.absentPeriods += periodCount
                    })
                })
            })

            return acc
        }, {
            excusedPeriods: 0,
            absentPeriods: 0
        })

        return result
    }
}