import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const scheduleService = {
    getAllScheduleEnrollment: async (studentId, date, type) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            select: { id: true }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }

        const selectedDate = new Date(date)

        const day = selectedDate.getDay() 
        const diffToMonday = day === 0 ? -6 : 1 - day

        const weekStart = new Date(selectedDate)
        weekStart.setDate(selectedDate.getDate() + diffToMonday)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

      
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: "REGISTERED"
            },
            include: {
                courseSection: {
                    include: {
                        subject: true,
                        semester: true,
                        
                        schedules: {
                            where: {
                                isActive: true,
                                startDate: { lte: weekEnd },
                                endDate: { gte: weekStart }
                            },
                            include : {
                                room : {
                                    include : {
                                        building : true
                                    }
                                }
                            }
                        },
                        exam: {
                             include : {
                                room : {
                                    include : {
                                        building : true
                                    }
                                }
                            }
                        }

                    }
                }
            }
        })

        const studySchedules = []
        const examSchedules = []

        for (const item of enrollments) {
            const section = item.courseSection

            // =============================
            // 📚 LỊCH HỌC (TRONG TUẦN)
            // =============================
            for (const schedule of section.schedules) {
                studySchedules.push({
                    subjectCode: section.subject.code,
                    subjectName: section.subject.name,
                    semester: section.semester.name,
                    academicYear: section.semester.academicYear,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTimeMinutes,
                    endTime: schedule.endTimeMinutes,
                    startDate: schedule.startDate,
                    endDate: schedule.endDate,
                    type: schedule.type,
                    room: `${schedule.room.building.symbol}.${schedule.room.name}`
                })
            }

            // =============================
            // 📝 LỊCH THI (TRONG TUẦN)
            // =============================
            if (
                section.exam &&
                section.exam.examDate >= weekStart &&
                section.exam.examDate <= weekEnd
            ) {
                examSchedules.push({
                    subjectCode: section.subject.code,
                    subjectName: section.subject.name,
                    semester: section.semester.name,
                    academicYear: section.semester.academicYear,
                    examDate: section.exam.examDate,
                    startMinute: section.exam.startMinute,
                    endMinute: section.exam.endMinute,
                    room: `${section.exam.room.building.symbol}.${section.exam.room.name}`
                })
            }
        }

        // =============================
        // 🎯 3️⃣ FILTER TYPE
        // =============================
        if (type === "STUDY") {
            return { weekStart, weekEnd, studySchedules }
        }

        if (type === "EXAM") {
            return { weekStart, weekEnd, examSchedules }
        }

        return {
            weekStart,
            weekEnd,
            studySchedules,
            examSchedules
        }
    }
}