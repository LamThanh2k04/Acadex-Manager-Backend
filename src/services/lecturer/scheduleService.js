import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const scheduleService = {
    getAllScheduleLecturer: async (lecturerUserId, date) => {

        const lecturer = await prisma.lecturer.findUnique({
            where: { userId: Number(lecturerUserId) },
            select: { id: true }
        })

        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
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


        const schedules = await prisma.schedule.findMany({
            where: {
                isActive: true,
                isPaused: true,
                startDate: { lte: weekEnd },
                endDate: { gte: weekStart },
                courseSection: {
                    lecturerId: lecturer.id
                }
            },
            include: {
                room: {
                    include: {
                        building: true
                    }
                },
                courseSection: {
                    include: {
                        subject: true,
                        semester: true
                    }
                }
            }
        })

        const studySchedules = []

        for (const schedule of schedules) {
            studySchedules.push({
                scheduleId: schedule.id,
                subjectCode: schedule.courseSection.subject.code,
                subjectName: schedule.courseSection.subject.name,
                semester: schedule.courseSection.semester.name,
                academicYear: schedule.courseSection.semester.academicYear,
                dayOfWeek: schedule.dayOfWeek,
                startTime: schedule.startTimeMinutes,
                endTime: schedule.endTimeMinutes,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                type: schedule.type,
                room: schedule.room
                    ? `${schedule.room.building.symbol}.${schedule.room.name}`
                    : "Online"
            })
        }


        return {
            weekStart,
            weekEnd,
            studySchedules
        }
    }
}