import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const dashboardService = {
    getOverView: async (lecturerUserId) => {

        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerUserId }
        })

        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }


        const today = new Date()
        const jsDay = today.getDay()
        const dbDayOfWeek = jsDay === 0 ? 8 : jsDay + 1

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const [
            teachingStudentIds,
            homeroomStudentIds,
            teachingClasseIds,
            homeroomClasseIds,
            totalSchedulesToday,
            totalPresentAttendance,
            totalAttendance
        ] = await Promise.all([


            prisma.enrollment.findMany({
                where: {
                    courseSection: { lecturerId: lecturer.id }
                },
                select: { studentId: true },
                distinct: ['studentId']
            }),


            prisma.student.findMany({
                where: {
                    class: { homeroomLecturerId: lecturer.id }
                },
                select: { id: true }
            }),

            prisma.courseSection.findMany({
                where: { lecturerId: lecturer.id },
                select: {
                    plannedClassId: true
                },
                distinct: ['plannedClassId']

            }),

            prisma.class.findMany({
                where: { homeroomLecturerId: lecturer.id }
            }),

            prisma.schedule.count({
                where: {
                    courseSection: { lecturerId: lecturer.id },
                    dayOfWeek: dbDayOfWeek,
                    startDate: { lte: endOfDay },
                    endDate: { gte: startOfDay },
                    isActive: true
                }
            }),

            prisma.attendance.count({
                where: {
                    status: 'PRESENT',
                    session: { lecturerId: lecturer.id }
                }
            }),

            prisma.attendance.count({
                where: {
                    session: { lecturerId: lecturer.id }
                }
            }),
        ])


        const studentSet = new Set()
        const classSet = new Set
        teachingStudentIds.forEach(s => studentSet.add(s.studentId))
        homeroomStudentIds.forEach(s => studentSet.add(s.id))
        teachingClasseIds.forEach(s => classSet.add(s.plannedClassId))
        homeroomClasseIds.forEach(s => classSet.add(s.id))
        const totalStudents = studentSet.size
        const totalClasses = classSet.size

        const attendanceRate =
            totalAttendance === 0
                ? 0
                : Math.round((totalPresentAttendance / totalAttendance) * 100)

        return {
            totalStudents,
            totalClasses,
            totalSchedulesToday,
            attendanceRate
        }
    },
    getAttendanceRate: async (lecturerUserId, courseSectionId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerUserId }
        })

        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }

        const whereCondition = {
            lecturerId: lecturer.id,
            ...(courseSectionId && { id: Number(courseSectionId) })
        }

        const grouped = await prisma.attendance.groupBy({
            by: ['status'],
            where: {
                session: {
                    schedule: {
                        courseSection: whereCondition
                    }
                }
            },
            _count: { status: true }
        })

        let present = 0
        let absent = 0
        let excused = 0

        for (const g of grouped) {
            if (g.status === 'PRESENT') present = g._count.status
            if (g.status === 'ABSENT') absent = g._count.status
            if (g.status === 'EXCUSED') excused = g._count.status
        }

        const total = present + absent + excused

        if (total === 0) {
            return {
                totalPresentRate: 0,
                totalAbsentRate: 0,
                totalExcusedRate: 0,
            }
        }

        return {
            totalPresentRate: Math.round((present / total) * 100),
            totalAbsentRate: Math.round((absent / total) * 100),
            totalExcusedRate: Math.round((excused / total) * 100),
        }
    },
    getAvgGradeByClass: async (lecturerUserId) => {

        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerUserId }
        })

        if (!lecturer) {
            throw new BadrequestException("Không tìm thấy giảng viên")
        }


        const sections = await prisma.courseSection.findMany({
            where: {
                lecturerId: lecturer.id,
                isActive: true
            },
            select: {
                id: true,
                sectionCode: true,
                plannedClass: {
                    select: {
                        name: true
                    }
                },
                enrollments: {
                    select: {
                        grades: {
                            select: {
                                totalScore: true
                            }
                        }
                    }
                }
            }
        })


        const result = sections.map(section => {
            const scores = section.enrollments
                .map(e => e.grades?.totalScore)
                .filter(Boolean)

            const avg =
                scores.length === 0
                    ? 0
                    : scores.reduce((a, b) => a + b, 0) / scores.length

            return {
                className: section.plannedClass.name,
                avgScore: Number(avg.toFixed(2))
            }
        })

        return result
    }

}