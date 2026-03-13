import { NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"

export const attendanceService = {
    getAllAttendances: async (date, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)

        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        const whereConditionDate = {
            sentToAdmin : true,
            ...(date ? {
                sessionDate: { gte: start, lte: end }
            } : {})
        }
        const [attendanceSessions, totalAttendanceSessions] = await Promise.all([
            prisma.attendanceSession.findMany({
                where: whereConditionDate,
                select: {
                    id : true,
                    sessionDate: true,
                    startedAt: true,
                    endedAt: true,
                    note: true,
                    isTaking: true,
                    schedule: {
                        select: {
                            dayOfWeek: true,
                            startTimeMinutes: true,
                            endTimeMinutes: true,
                            type: true,
                            courseSection: {
                                select: {
                                    sectionCode: true,
                                    subject: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    lecturer: {
                        select: {
                            lecturerCode: true,
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                },
                take: limit,
                skip: skip,
                orderBy: { sessionDate: 'desc' }
            }),
            prisma.attendanceSession.count({
                where: whereConditionDate
            })
        ])
        return {
            attendanceSessions,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalAttendanceSessions,
                totalPages: Math.ceil(totalAttendanceSessions / limit)
            }
        }
    },
    getInfoAttendancesSession: async (attendanceId) => {
        const attendanceSession = await prisma.attendanceSession.findUnique({
            where : {
                id : Number(attendanceId)
            }
        })
        if (!attendanceSession) {
            throw new NotFoundException('Không tìm thấy đc id điểm danh này')
        }
        const infoAttendancesSession = prisma.attendanceSession.findMany({
            where: {
                id : Number(attendanceId)
            },
            select: {
                sessionDate: true,
                startedAt: true,
                endedAt: true,
                note: true,
                isTaking: true,
                attendances: {
                    select: {
                        student: {
                            select: {
                                studentCode: true,
                                user: {
                                    select: {
                                        fullName: true,
                                        avatar: true
                                    }
                                }
                            }
                        }
                    }
                },
                schedule: {
                    select: {
                        dayOfWeek: true,
                        startTimeMinutes: true,
                        endTimeMinutes: true,
                        type: true,
                        courseSection: {
                            select: {
                                sectionCode: true,
                                subject: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                lecturer: {
                    select: {
                        lecturerCode: true,
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            },
        })
        return {
            infoAttendancesSession
        }
    }
    

}
