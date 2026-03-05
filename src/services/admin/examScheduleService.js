import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const examScheduleService = {
    getAvailableRooms: async (date, startTime, endTime) => {
        const examDate = new Date(date)
        const startMinute = Number(startTime)
        const endMinute = Number(endTime)
        const dayOfWeek = examDate.getDay()
        const examConflicts = await prisma.examSchedule.findMany({
            where: {
                examDate: examDate,
                startMinute: { lt: endMinute },
                endMinute: { gt: startMinute }
            },
            select: { roomId: true }
        })

        const examConflictRoomIds = examConflicts.map(e => e.roomId)

        const scheduleConflicts = await prisma.schedule.findMany({
            where: {
                isActive: true,
                dayOfWeek: dayOfWeek,
                startDate: { lt: examDate },
                endDate: { gt: examDate },
                startTimeMinutes: { lte: endMinute },
                endTimeMinutes: { gte: startMinute }
            },
            select: { roomId: true }
        })

        const scheduleConflictRoomIds = scheduleConflicts.map(s => s.roomId)

        const conflictRoomIds = [
            ...new Set([...examConflictRoomIds, ...scheduleConflictRoomIds])
        ]
        const availableRooms = await prisma.room.findMany({
            where: {
                id: { notIn: conflictRoomIds },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                building: {
                    select: {
                        id: true,
                        name: true,
                        symbol: true
                    }
                }
            }
        })
        return {
            availableRooms
        }
    },
    getCourseSectionHaveSchedule: async (semesterId) => {
        const courseSections = await prisma.courseSection.findMany({
            where: {
                semesterId: Number(semesterId),
                isActive: true,
                schedules: {
                    some: {
                        isActive: true
                    }
                },
                OR: [
                    { exam: { is: null } },
                    { exam: { is: { isActive: false } } }
                ]
            },
            select: {
                id: true,
                sectionCode: true,
                subject: {
                    select: {
                        name: true
                    }
                },
                lecturer: {
                    select: {
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        })
        return {
            courseSections
        }
    },
    suggestExamSchedule: async (courseSectionId) => {

        const [courseSection, schedules] = await Promise.all([
            prisma.courseSection.findUnique({
                where: { id: Number(courseSectionId) }
            }),
            prisma.schedule.findMany({
                where: { courseSectionId: Number(courseSectionId), isActive: true },
                orderBy: { endDate: 'desc' }
            })
        ])
        if (!courseSection) {
            throw new NotFoundException("Không tìm thấy học phần")
        }
        if (schedules.length === 0) {
            throw new BadrequestException("Học phần chưa có lịch học")
        }

        const lastSchedule = schedules[0]
        const suggestedExamDate = new Date(lastSchedule.endDate)
        suggestedExamDate.setDate(suggestedExamDate.getDate() + 7)
        return {
            lastStudyDate: lastSchedule.endDate,
            suggestedExamDate
        }
    },
    createExamSchedule: async (data) => {
        validateMissingFields(data, ['examDate', 'startMinute', 'endMinute', 'courseSectionId', 'roomId'])
        const { examDate, startMinute, endMinute, courseSectionId, roomId, note } = data

        const dayOfWeek = new Date(examDate).getDay()
        const [courseSection, room] = await Promise.all([
            prisma.courseSection.findUnique({
                where: { id: Number(courseSectionId) }
            }),
            prisma.room.findUnique({
                where: { id: Number(roomId) }
            })
        ])
        if (!courseSection) {
            throw new NotFoundException('Không tìm thấy học phần này')
        }
        if (!room) {
            throw new NotFoundException('Không tìm thấy phòng học này')
        }
        if (Number(startMinute) >= Number(endMinute)) {
            throw new BadrequestException("Thời gian kết thúc phải sau thời gian bắt đầu")
        }

        const [examConflicts, scheduleConflicts, existingExam] = await Promise.all([
            prisma.examSchedule.findMany({
                where: {
                    roomId: Number(roomId),
                    examDate: new Date(examDate),
                    startMinute: { lt: Number(endMinute) },
                    endMinute: { gt: Number(startMinute) },
                    isActive: true
                }
            }),
            prisma.schedule.findMany({
                where: {
                    roomId: Number(roomId),
                    isActive: true,
                    dayOfWeek: dayOfWeek,
                    startDate: { lte: new Date(examDate) },
                    endDate: { gte: new Date(examDate) },
                    startTimeMinutes: { lt: Number(endMinute) },
                    endTimeMinutes: { gt: Number(startMinute) },
                }
            }),
            prisma.examSchedule.findFirst({
                where: {
                    courseSectionId: Number(courseSectionId)
                }
            })
        ])
        if (examConflicts.length > 0) {
            throw new BadrequestException("Phòng đã có lịch thi trong khung giờ và ngày này")
        }
        if (scheduleConflicts.length > 0) {
            throw new BadrequestException("Phòng đã có lịch học trong khung giờ và ngày này")
        }
        if (existingExam) {
            throw new BadrequestException("Học phần đã có lịch thi")
        }

        const examSchedule = await prisma.examSchedule.create({
            data: {
                courseSectionId: Number(courseSectionId),
                roomId: Number(roomId),
                examDate: new Date(examDate),
                startMinute: Number(startMinute),
                endMinute: Number(endMinute),
                note: note?.trim() || null
            }
        })
        return {
            examSchedule
        }
    },
    updateExamScheduleInfo: async (examScheduleId, data) => {

        const { examDate, startMinute, endMinute, roomId, note } = data

        const examSchedule = await prisma.examSchedule.findUnique({
            where: { id: Number(examScheduleId) }
        })

        if (!examSchedule) {
            throw new NotFoundException("Không tìm thấy lịch thi này")
        }

        // =============================
        // 1️⃣ TÍNH GIÁ TRỊ MỚI
        // =============================

        const newExamDate = examDate ? new Date(examDate) : examSchedule.examDate
        const newStart = startMinute !== undefined ? Number(startMinute) : examSchedule.startMinute
        const newEnd = endMinute !== undefined ? Number(endMinute) : examSchedule.endMinute
        const newRoomId = roomId !== undefined ? Number(roomId) : examSchedule.roomId

        if (newStart >= newEnd) {
            throw new BadrequestException("Thời gian kết thúc phải sau thời gian bắt đầu")
        }

        const dayOfWeek = newExamDate.getDay()

        // =============================
        // 2️⃣ CHECK ROOM (nếu có đổi)
        // =============================

        if (roomId !== undefined) {
            const room = await prisma.room.findUnique({
                where: { id: newRoomId }
            })

            if (!room) {
                throw new NotFoundException("Không tìm thấy phòng học này")
            }
        }

        // =============================
        // 3️⃣ CHECK TRÙNG EXAM
        // =============================

        const examConflict = await prisma.examSchedule.findFirst({
            where: {
                id: { not: Number(examScheduleId) }, // loại trừ chính nó
                roomId: newRoomId,
                examDate: newExamDate,
                startMinute: { lt: newEnd },
                endMinute: { gt: newStart }
            }
        })

        if (examConflict) {
            throw new BadrequestException("Phòng đã có lịch thi trong khung giờ này")
        }

        // =============================
        // 4️⃣ CHECK TRÙNG LỊCH HỌC
        // =============================

        const scheduleConflict = await prisma.schedule.findFirst({
            where: {
                roomId: newRoomId,
                isActive: true,
                dayOfWeek: dayOfWeek,
                startDate: { lte: newExamDate },
                endDate: { gte: newExamDate },
                startTimeMinutes: { lt: newEnd },
                endTimeMinutes: { gt: newStart }
            }
        })

        if (scheduleConflict) {
            throw new BadrequestException("Phòng đang có lịch học trong khung giờ này")
        }

        // =============================
        // 5️⃣ UPDATE
        // =============================

        const updateExamScheduleInfo = await prisma.examSchedule.update({
            where: { id: Number(examScheduleId) },
            data: {
                examDate: newExamDate,
                startMinute: newStart,
                endMinute: newEnd,
                roomId: newRoomId,
                note: note !== undefined ? note.trim() || null : examSchedule.note
            }
        })

        return {
            updateExamScheduleInfo
        }
    },
    updateExamScheduleStatus: async (examScheduleId) => {
        const examSchedule = await prisma.examSchedule.findUnique({
            where: { id: Number(examScheduleId) }
        })
        if (!examSchedule) {
            throw new NotFoundException("Không tìm thấy lịch thi này")
        }
        const updateExamScheduleStatus = await prisma.examSchedule.update({
            where: { id: Number(examScheduleId) },
            data: {
                isActive: !examSchedule.isActive
            }
        })
        return {
            updateExamScheduleStatus
        }
    },
    getAllExamSchedules: async (search,page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit;
        const whereCondition = search ? {
            OR: [
                {
                    courseSection: {
                        sectionCode: {
                            contains: search.toLowerCase()
                        }
                    }
                },
                {
                    courseSection: {
                        subject: {
                            name: {
                                contains: search.toLowerCase()
                            }
                        }
                    }
                },
                {
                    room: {
                        name: {
                            contains : search.toLowerCase()
                        }
                    }
                }
            ]
        } : {}
        const [examSchedules, totalExamSchedules] = await Promise.all([
            prisma.examSchedule.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    examDate: true,
                    startMinute: true,
                    endMinute: true,
                    note: true,
                    courseSection: {
                        select: {
                            sectionCode: true,
                            subject: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    room: {
                        select: {
                            name: true,
                            building: {
                                select: {
                                    symbol: true
                                }
                            }
                        }
                    }
                }
            })
        ])
        return {
            examSchedules,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalExamSchedules,
                totalPages: Math.ceil(totalExamSchedules / limit)
            }
        }
    }
}