import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const scheduleService = {
    createSchedule: async (data) => {
        validateMissingFields(data, ['courseSectionId', 'dayOfWeek', 'startTimeMinutes', 'endTimeMinutes', 'startDate', 'endDate', 'type', 'roomId',])
        const { courseSectionId, dayOfWeek, startTimeMinutes, endTimeMinutes, startDate, endDate, type, practiceGroup, maxStudents, roomId, meetingLink } = data
        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)
        if (!Number.isInteger(Number(dayOfWeek)) || dayOfWeek < 2 || dayOfWeek > 8) {
            throw new BadrequestException("Ngày trong tuần không hợp lệ")
        }

        if (startTimeMinutes >= endTimeMinutes) {
            throw new BadrequestException('Giờ kết thúc phải lớn hơn giờ bắt đầu')
        }
        if (isNaN(parsedStartDate.getTime())) {
            throw new BadrequestException("Thời gian bắt đầu không hợp lệ")
        }
        if (isNaN(parsedEndDate.getTime())) {
            throw new BadrequestException("Thời gian kết thúc không hợp lệ")
        }
        if (parsedStartDate > parsedEndDate) {
            throw new BadrequestException('Ngày kết thúc phải sau ngày bắt đầu')
        }
        // if (type === 'PRACTICE' && !practiceGroup) {
        //     throw new BadrequestException("Phải nhập nhóm thực hành")
        // }


        const [courseSection, room] = await Promise.all([
            prisma.courseSection.findUnique({
                where: { id: Number(courseSectionId) }
            }),
            prisma.room.findUnique({
                where: { id: Number(roomId) }
            })
        ])
        if (!courseSection) {
            throw new NotFoundException("Không tìm thấy học phần này")
        }
        if (!room) {
            throw new NotFoundException("Không tìm thấy phòng học")
        }


        const conflict = await prisma.schedule.findFirst({
            where: {
                roomId: Number(roomId),
                dayOfWeek: Number(dayOfWeek),
                isActive: true,

                startTimeMinutes: { lt: Number(endTimeMinutes) },
                endTimeMinutes: { gt: Number(startTimeMinutes) },

                startDate: { lt: parsedEndDate },
                endDate: { gt: parsedStartDate }
            }
        })

        if (conflict) {
            throw new ConflictException("Phòng đã có lịch trùng thời gian");
        }

        const schedule = await prisma.schedule.create({
            data: {
                courseSectionId: Number(courseSectionId),
                dayOfWeek: Number(dayOfWeek),
                startTimeMinutes: Number(startTimeMinutes),
                endTimeMinutes: Number(endTimeMinutes),
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                type: type,
                roomId: Number(roomId),
                meetingLink: meetingLink ? String(meetingLink) : null,
                practiceGroup: practiceGroup ? Number(practiceGroup) : null,
                maxStudents: maxStudents ? Number(maxStudents) : courseSection.maxStudents
            }
        })
        return {
            schedule
        }
    },
    updateScheduleInfo: async (scheduleId, data) => {
        const { dayOfWeek, startTimeMinutes, endTimeMinutes, startDate, endDate, maxStudents, roomId, meetingLink } = data
        const schedule = await prisma.schedule.findUnique({
            where: { id: Number(scheduleId) }
        })

        if (!schedule) {
            throw new NotFoundException("Không tìm thấy lịch này")
        }
        const newDayOfWeek = dayOfWeek !== undefined ? Number(dayOfWeek) : schedule.dayOfWeek
        const newStartTime = startTimeMinutes !== undefined ? Number(startTimeMinutes) : schedule.startTimeMinutes
        const newEndTime = endTimeMinutes !== undefined ? Number(endTimeMinutes) : schedule.endTimeMinutes
        const newRoomId = roomId !== undefined ? Number(roomId) : schedule.roomId
        const newStartDate = startDate ? new Date(startDate) : schedule.startDate
        const newEndDate = endDate ? new Date(endDate) : schedule.endDate
        const newMaxStudents = maxStudents !== undefined ? Number(maxStudents) : schedule.maxStudents
        if (newStartTime >= newEndTime) {
            throw new BadrequestException("Giờ kết thúc phải lớn hơn giờ bắt đầu")
        }

        if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
            throw new BadrequestException("Ngày không hợp lệ")
        }

        if (newStartDate > newEndDate) {
            throw new BadrequestException("Ngày kết thúc phải sau ngày bắt đầu")
        }
        if (roomId !== undefined) {
            const room = await prisma.room.findUnique({
                where: { id: newRoomId }
            })

            if (!room) {
                throw new NotFoundException("Không tìm thấy phòng học")
            }
        }
        if (
            maxStudents !== undefined &&
            (schedule.type === 'THEORY' || schedule.type === 'ONLINE')
        ) {
            throw new BadrequestException("Không được thay đổi maxStudents")
        }

        if (maxStudents !== undefined) {
            const enrolledCount = await prisma.enrollment.count({
                where: {
                    courseSectionId: schedule.courseSectionId,
                    status: "REGISTERED" 
                }
            })

            if (newMaxStudents < enrolledCount) {
                throw new BadrequestException(
                    "Số lượng tối đa không được nhỏ hơn số sinh viên đã đăng ký"
                )
            }
        }



        const conflict = await prisma.schedule.findFirst({
            where: {
                roomId: newRoomId,
                dayOfWeek: newDayOfWeek,
                isActive: true,

                startTimeMinutes: { lt: newEndTime },
                endTimeMinutes: { gt: newStartTime },

                startDate: { lt: newEndDate },
                endDate: { gt: newStartDate },

                NOT: { id: Number(scheduleId) }
            }
        })

        if (conflict) {
            throw new ConflictException("Phòng đã có lịch trùng thời gian")
        }
        if (
            maxStudents !== undefined &&
            (schedule.type === 'THEORY' || schedule.type === 'ONLINE')
        ) {
            throw new BadrequestException("Không được thay đổi maxStudents")
        }
        const updateData = {
            dayOfWeek: newDayOfWeek,
            startTimeMinutes: newStartTime,
            endTimeMinutes: newEndTime,
            startDate: newStartDate,
            endDate: newEndDate,
            roomId: newRoomId,
            maxStudents: newMaxStudents
        }
        if (meetingLink !== undefined) {
            updateData.meetingLink = meetingLink
                ? String(meetingLink)
                : null
        }

        const updatedSchedule = await prisma.schedule.update({
            where: { id: Number(scheduleId) },
            data: updateData
        })

        return { updatedSchedule }
    },
    updateScheduleStatus: async (scheduleId) => {

        const schedule = await prisma.schedule.findUnique({
            where: { id: Number(scheduleId) },
            include: {
                courseSection: true
            }

        })
        const enrollments = await prisma.enrollment.count({ where: { courseSectionId: Number(schedule.courseSection.id) } })

        if (!schedule) {
            throw new NotFoundException("Không tìm thấy lịch học phần này này")
        }

        if (enrollments > 0) {
            throw new BadrequestException("KHông được khóa lịch học phần này vì có sinh viên đăng kí")
        }
        const updateScheduleStatus = await prisma.schedule.update({
            where: { id: Number(scheduleId) },
            data: {
                isActive: !schedule.isActive
            }
        })
        return {
            updateScheduleStatus
        }
    },
    getAllSchedules: async (search, semesterId, type, dayOfWeek, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(search ? {
                OR: [
                    {
                        courseSection: {
                            sectionCode: {
                                contains: search.toLowerCase(),
                            }
                        }
                    },
                    {
                        courseSection: {
                            subject: {
                                name: {
                                    contains: search.toLowerCase(),
                                }
                            }
                        }
                    }
                ]
            } : {}),

            ...(type ? {
                type: type
            } : {}),

            ...(dayOfWeek ? {
                dayOfWeek: Number(dayOfWeek)
            } : {}),

            ...(semesterId ? {
                courseSection: {
                    semesterId: Number(semesterId)
                }
            } : {})
        }
        const [schedules, totalSchedules] = await Promise.all([
            prisma.schedule.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    dayOfWeek: true,
                    startTimeMinutes: true,
                    endTimeMinutes: true,
                    startDate: true,
                    endDate: true,
                    type: true,
                    practiceGroup: true,
                    maxStudents: true,
                    meetingLink: true,
                    isActive: true,
                    courseSection: {
                        select: {
                            semester: {
                                select: {
                                    name: true,
                                    academicYear: true
                                }
                            },
                            sectionCode: true,
                            lecturer: {
                                select: {
                                    user: {
                                        select: {
                                            fullName: true
                                        }
                                    }
                                }
                            },
                            subject: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    room: {
                        select: {
                            id: true,
                            name: true,
                            building: {
                                select: {
                                    name: true,
                                    symbol: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.schedule.count({
                where: whereCondition
            })
        ])
        return {
            schedules,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalSchedules,
                totalPages: Math.ceil(totalSchedules / limit)
            }
        }
    },

}