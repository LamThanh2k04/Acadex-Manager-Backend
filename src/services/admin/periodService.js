import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const periodService = {
    createPeriod: async (data) => {
        validateMissingFields(data, ['period', 'startTime', 'endTime'])
        const { period, startTime, endTime } = data

        if (!Number.isInteger(Number(period))) {
            throw new BadrequestException("Tiết học không hợp lệ")
        }
        if (!Number.isInteger(Number(startTime))) {
            throw new BadrequestException("Thời gian bắt đầu tiết không hợp lệ")
        }
        if (!Number.isInteger(Number(endTime))) {
            throw new BadrequestException("Thời gian kết thúc tiết không hợp lệ")
        }
        if (Number(startTime) >= Number(endTime)) {
            throw new BadrequestException("Thời gian kết thúc phải sau thời gian bắt đầu")
        }

        const [existingPeriodSetting, overlappingPeriod] = await Promise.all([
            prisma.periodSetting.findFirst({
                where: { period: Number(period) }
            }),
            prisma.periodSetting.findFirst({
                where: {
                    AND: [
                        { startTime: { lt: Number(endTime) } },
                        { endTime: { gt: Number(startTime) } }
                    ]
                }
            })
        ])
        if (existingPeriodSetting) {
            throw new ConflictException(`Đã tồn tại tiết ${existingPeriodSetting.period}`)
        }
        if (overlappingPeriod) {
            throw new BadrequestException("Thời gian tiết học đã bị trùng")
        }

        const newPeriod = await prisma.periodSetting.create({
            data: {
                period: Number(period),
                startTime: Number(startTime),
                endTime: Number(endTime)
            }
        })
        return {
            newPeriod
        }
    },
    updatePeriodInfo: async (periodId, data) => {
        validateMissingFields(data, ['period', 'startTime', 'endTime'])
        const { period, startTime, endTime } = data

        if (!Number.isInteger(Number(period))) {
            throw new BadrequestException("Tiết học không hợp lệ")
        }
        if (!Number.isInteger(Number(startTime))) {
            throw new BadrequestException("Thời gian bắt đầu tiết không hợp lệ")
        }
        if (!Number.isInteger(Number(endTime))) {
            throw new BadrequestException("Thời gian kết thúc tiết không hợp lệ")
        }
        if (Number(startTime) >= Number(endTime)) {
            throw new BadrequestException("Thời gian kết thúc phải sau thời gian bắt đầu")
        }

        const [existingPeriod, existingPeriodSetting, overlappingPeriod] = await Promise.all([
            prisma.periodSetting.findUnique({ where: { id: Number(periodId) } }),
            prisma.periodSetting.findFirst({
                where: { period: Number(period), NOT: { id: Number(periodId) } }
            }),
            prisma.periodSetting.findFirst({
                where: {
                    NOT: { id: Number(periodId) },
                    AND: [
                        { startTime: { lt: Number(endTime) } },
                        { endTime: { gt: Number(startTime) } }
                    ]
                }
            })
        ])
        if (!existingPeriod) {
            throw new NotFoundException("Không tìm thấy tiết này")
        }
        if (existingPeriodSetting) {
            throw new ConflictException(`Đã tồn tại tiết ${existingPeriodSetting.period}`)
        }
        if (overlappingPeriod) {
            throw new BadrequestException("Thời gian tiết học đã bị trùng")
        }
        const updatePeriodInfo = await prisma.periodSetting.update({
            where: { id: Number(periodId) },
            data: {
                period: Number(period),
                startTime: Number(startTime),
                endTime: Number(endTime)
            }
        })
        return {
            updatePeriodInfo
        }
    },
    updatePeriodStatus: async (periodId) => {
        const existingPeriod = await prisma.periodSetting.findUnique({
            where: { id: Number(periodId) }
        })
        if (!existingPeriod) {
            throw new NotFoundException("Không tìm thấy tiết này")
        }
        const updatePeriodStatus = await prisma.periodSetting.update({
            where: { id: Number(periodId) },
            data: {
                isActive: !existingPeriod.isActive
            }
        })
        return {
            updatePeriodStatus
        }
    },
    getAllPeriods: async (period, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(period ? { period: Number(period) } : {})
        }
        const [periods, totalPeriods] = await Promise.all([
            prisma.periodSetting.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { period: 'asc' }
            }),
            prisma.periodSetting.count({
                where: whereCondition
            })
        ])
        return {
            periods,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalPeriods,
                totalPage: Math.ceil(totalPeriods/limit)
            }
        }
    },
    getAllPeriodsSimple: async () => {
        const periods = await prisma.periodSetting.findMany({
            where: { isActive: true },
            orderBy: { period: 'asc' },
            select: {
                id: true,
                period: true,
                startTime: true,
                endTime: true
            }
        })
        return {
            periods
        }
    }
}
