import { NotFoundException } from "../../common/helpers/exception.helper"
import prisma from "../../common/prisma/initPrisma"

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
            totalClassesTeaching,
            totalClassesHomeroom,
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

            prisma.courseSection.count({
                where: { lecturerId: lecturer.id }
            }),

            prisma.class.count({
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

        teachingStudentIds.forEach(s => studentSet.add(s.studentId))
        homeroomStudentIds.forEach(s => studentSet.add(s.id))

        const totalStudents = studentSet.size


        const attendanceRate =
            totalAttendance === 0
                ? 0
                : Math.round((totalPresentAttendance / totalAttendance) * 100)

        return {
            totalStudents,
            totalClasses: totalClassesTeaching + totalClassesHomeroom,
            totalSchedulesToday,
            attendanceRate
        }
    },
    getAttendanceRate: async (lecturerId, courseSectionId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerId }
        })
        if (!lecturer) {
            throw new NotFoundException('Không tìm thấy giảng viên này')
        }
        const whereCondition = {

            ...(courseSectionId ? {
                id: Number(courseSectionId)
            } : {}),
            lecturerId: lecturer.id
        }

        const records = await prisma.attendance.findMany({
            where: {
                session: {
                    schedule: {
                        courseSection: whereCondition
                    }
                },
            },
            select: {
                status: true
            }
        })
        let present = 0
        let absent = 0
        let excused = 0

        for (const r of records) {
            if (r.status === "PRESENT") present++
            if (r.status === "ABSENT") absent++
            if (r.status === "EXCUSED") excused++
        }
        total = records.length
        if (total === 0) {
            return {
                totalPresentRate: 0,
                totalAbsentRate: 0,
                totalExcusedRate: 0,
            }
        }
        const presentRate = Number(((present / total) * 100).toFixed(2))
        const absentRate = Number(((absent / total) * 100).toFixed(2))
        const excusedRate = Number(((excused / total) * 100).toFixed(2))
        return {
            totalPresentRate: presentRate,
            totalAbsentRate: absentRate,
            totalExcusedRate: excusedRate,
        }
    },
    getAvgGradeByClass: async (lecturerUserId) => {
        // 1️⃣ Tìm giảng viên
        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: lecturerUserId }
        })

        if (!lecturer) {
            throw new BadrequestException("Không tìm thấy giảng viên")
        }

        // 2️⃣ Lấy các lớp giảng viên dạy
        const sections = await prisma.courseSection.findMany({
            where: {
                lecturerId: lecturer.id,
                isActive: true
            },
            select: {
                id: true,
                sectionCode: true,
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

        // 3️⃣ Tính điểm trung bình từng lớp
        const result = sections.map(section => {
            const scores = section.enrollments
                .map(e => e.grades?.totalScore)
                .filter(Boolean)

            const avg =
                scores.length === 0
                    ? 0
                    : scores.reduce((a, b) => a + b, 0) / scores.length

            return {
                className: section.sectionCode,
                avgScore: Number(avg.toFixed(2))
            }
        })

        return result
    }

}