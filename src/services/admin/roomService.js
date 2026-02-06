import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const roomService = {
    createRoom: async (data) => {
        validateMissingFields(data, ['name', 'buildingId'])
        const { name, buildingId } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên phòng không hợp lệ")
        }
        if (!Number.isInteger(Number(buildingId))) {
            throw new BadrequestException("Cơ sở không hợp lệ")
        }
        const [existingRoom, existingBuilding] = await Promise.all([
            prisma.room.findFirst({ where: { name: name.trim(), buildingId: Number(buildingId) } }),
            prisma.building.findUnique({ where: { id: Number(buildingId) } })
        ])
        if (existingRoom) {
            throw new ConflictException("Phòng đã tồn tại tại cơ sở này")
        }
        if (!existingBuilding) {
            throw new NotFoundException("Không tìm thấy cơ sở")
        }

        const newRoom = await prisma.room.create({
            data: {
                name: name.trim(),
                buildingId: Number(buildingId),
            }
        })
        return {
            newRoom,
            displayName: `${existingBuilding.symbol}.${name.trim()}`

        }
    },
    updateRoomInfo: async (roomId, data) => {
        validateMissingFields(data, ['name', 'buildingId'])

        const { name, buildingId } = data

        if (name.trim() === '') {
            throw new BadrequestException("Tên phòng không hợp lệ")
        }
        if (!Number.isInteger(Number(buildingId))) {
            throw new BadrequestException("Cơ sở không hợp lệ")
        }

        const [room, existingRoom, building] = await Promise.all([
            prisma.room.findUnique({ where: { id: Number(roomId) } }),
            prisma.room.findFirst({ where: { name: name, buildingId: Number(buildingId), NOT: { id: Number(roomId) } } }),
            prisma.building.findUnique({ where: { id: Number(buildingId) } })
        ])

        if (!room) {
            throw new NotFoundException("Không tìm thấy phòng")
        }
        if (existingRoom) {
            throw new ConflictException("Phòng đã tồn tại trong cơ cở này")
        }
        if (!building) {
            throw new NotFoundException("Không tìm thấy cơ sở")
        }

        const updateRoomInfo = await prisma.room.update({
            where: { id: Number(roomId) },
            data: {
                name: name.trim(),
                buildingId: Number(buildingId),
            }
        })
        return {
            updateRoomInfo,
            displayName: `${building.symbol}.${name.trim()}`

        }
    },
    updateRoomStatus: async (roomId) => {
        const room = await prisma.room.findUnique({ where: { id: Number(roomId) } })
        if (!room) {
            throw new NotFoundException("Không tìm thấy phòng này")
        }
        const updateRoomStatus = await prisma.room.update({
            where: { id: Number(roomId) },
            data: {
                isActive: !room.isActive
            }
        })
        return {
            updateRoomStatus
        }
    },
    getAllRooms: async (roomName, buildingId, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit;
        const whereCondition = {
            ...(roomName ? { name: { contains: roomName.toLowerCase() } } : {}),
            ...(buildingId ? { buildingId: Number(buildingId) } : {})
        }

        const [rooms, totalRooms] = await Promise.all([
            prisma.room.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    building: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            symbol: true,
                            location: true,
                            isActive: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.room.count({
                where: whereCondition
            })
        ])
        return {
            rooms,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalRooms,
                totalPages: Math.ceil(totalRooms / limit)
            }
        }
    },
    getAllRoomsSimple: async () => {
        const rooms = await prisma.room.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                building: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        symbol: true
                    }
                }
            }
        })
        return {
            rooms
        }
    }
}