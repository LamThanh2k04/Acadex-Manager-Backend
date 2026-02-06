import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js";
import prisma from "../../common/prisma/initPrisma.js";
import validateMissingFields from "../../utils/validateFields.js"

export const buildingService = {
    createBuilding : async (data) => {
        validateMissingFields(data,['code','name','symbol','location'])
        const {code,name,symbol,location} = data;

        if (typeof code !== 'string' || code.trim() === '') {
            throw new BadrequestException("Mã cơ sở không hợp lệ")
        }
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên cơ sở không hợp lệ")
        }
         if (typeof symbol !== 'string' || symbol.trim() === '') {
            throw new BadrequestException("Ký hiệu cơ sở không hợp lệ")
        }
         if (typeof location !== 'string' || location.trim() === '') {
            throw new BadrequestException("Vị trí cơ sở không hợp lệ")
        }
        if (typeof location !== 'string' || location.trim() === '') {
            throw new BadrequestException("Vị trí cơ sở không hợp lệ")
        }
       const [existingBuildingCode, existingBuildingName, existingBuildingSymbol] = await Promise.all([
            prisma.building.findUnique({where : {code : code.trim()}}),
            prisma.building.findFirst({where : {name : name.trim()}}),
            prisma.building.findFirst({where : {symbol : symbol.trim()}})
       ])
         if (existingBuildingCode) {   
            throw new ConflictException("Mã cơ sở đã tồn tại")
         }
            if (existingBuildingName) {
            throw new ConflictException("Tên cơ sở đã tồn tại")
            }
            if (existingBuildingSymbol) {
            throw new ConflictException("Ký hiệu cơ sở đã tồn tại")
            }
        const newBuilding = await prisma.building.create({
            data : {
                code : code.trim(),
                name : name.trim(),
                symbol : symbol.trim(),
                location : location.trim()
            }
        })
        return {
            newBuilding
        }
    },
    updateBuildingInfo : async (buildingId,data) => {
        validateMissingFields(data,['name','symbol','location'])
        const {name,symbol,location} = data;

        if ( typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên cơ sở không hợp lệ")
        }
        if ( typeof symbol !== 'string' || symbol.trim() === '') {
            throw new BadrequestException("Ký hiệu cơ sở không hợp lệ")
        }
        if ( typeof location !== 'string' || location.trim() === '') {
            throw new BadrequestException("Vị trí cơ sở không hợp lệ")
        }
        const [building,existingBuildingName, existingBuildingSymbol] = await Promise.all([
            prisma.building.findUnique({where : {id : Number(buildingId)}}),
            prisma.building.findFirst({where : {name : name.trim(), NOT : {id : Number(buildingId)}}}),
            prisma.building.findFirst({where : {symbol : symbol.trim(), NOT : {id : Number(buildingId)}}})
       ])
        if (!building) {
            throw new NotFoundException("Cơ sở không tồn tại")
        }
         if (existingBuildingName) {   
            throw new ConflictException("Tên cơ sở đã tồn tại")
         }
         if (existingBuildingSymbol) {
            throw new ConflictException("Ký hiệu cơ sở đã tồn tại")
         }
        const updateBuildingInfo = await prisma.building.update({
            where: { id: Number(buildingId) },
            data: {
                name: name.trim(),
                symbol: symbol.trim(),
                location: location.trim()
            }
        })
        return {
            updateBuildingInfo
        }
    },
    updateBuildingStatus : async (buildingId) => {
        const building = await prisma.building.findUnique({where : {id : Number(buildingId)}})
        if (!building) {
            throw new NotFoundException("Cơ sở không tồn tại")
        }
        const updateBuildingStatus = await prisma.building.update({
            where : {id : Number(buildingId)},
            data : {
                isActive : !building.isActive
            }
        })
        return {
            updateBuildingStatus
        }
    },
    getAllBuildings : async (buildingName,buildingLocation,page) => {
        const limit = 10;
        const skip = (Number(page) -1) * limit;
        const whereCondition = {
            ...(buildingName ? {name : {contains : buildingName.toLowerCase()}} : {}),
            ...(buildingLocation ? {location : {contains : buildingLocation.toLowerCase()}} : {})
        }

        const [buildings,totalBuildings] =await Promise.all([
            prisma.building.findMany({
                where : whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'}
            }),
            prisma.building.count({where : whereCondition})
        ])
        return {
            buildings,
            pagination : {
                page : Number(page),
                limit : limit,
                totalBuildings : totalBuildings,
                totalPages : Math.ceil(totalBuildings / limit)
            }
        }
    },
    getAllBuildingsSimple : async () => {
        const buildings = await prisma.building.findMany({
            where : {isActive : true},
            orderBy : {createdAt : 'desc'},
            select : {
                id : true,
                name : true,
                symbol : true,
                location : true
            }
        })
        return {
            buildings
        }
    }

}