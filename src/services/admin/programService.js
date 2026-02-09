import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateProgramCode from "../../common/helpers/generateProgramCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const programService = {
    createProgram: async (data) => {
        validateMissingFields(data, ['name', 'trainingLevel', 'educationType', 'plannedEducationYear', 'feePerCredit', 'version', 'majorId'])
        const { name, trainingLevel, educationType, plannedEducationYear, feePerCredit, version, majorId } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chương trình không hợp lệ")
        }
        if (typeof trainingLevel !== 'string' || trainingLevel.trim() === '') {
            throw new BadrequestException("Tên bậc đào tạo không hợp lệ")
        }
        if (typeof educationType !== 'string' || educationType.trim() === '') {
            throw new BadrequestException("Tên hình thức đào tạo không hợp lệ")
        }
        if (!Number.isFinite(Number(plannedEducationYear))) {
            throw new BadrequestException("Năm đào tạo dự kiến không hợp lệ")
        }
        if (!Number.isInteger(Number(feePerCredit)) || Number(feePerCredit) < 0) {
            throw new BadrequestException("Số tiền cho một tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(version)) || Number(version) < 1) {
            throw new BadrequestException("Phiên bản chương trình không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException("Ngành không hợp lệ không hợp lệ")
        }
        const baseCode = generateProgramCode(name.trim())
        let programCode = baseCode;
        let index = 1;
        while (await prisma.program.findUnique({ where: { code: programCode } })) {
            programCode = `${baseCode}-${index}`
            index++
        }
        const [major, programName] = await Promise.all([
            prisma.major.findUnique({ where: { id: Number(majorId) } }),
            prisma.program.findFirst({
                where: { name: name.trim(), version: Number(version), majorId: Number(majorId) }
            })
        ])
        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }
        if (programName) {
            throw new ConflictException("Chương trình của ngành này trong năm này đã tồn tại")
        }
        const program = await prisma.program.create({
            data: {
                code: programCode,
                name: name.trim(),
                trainingLevel: trainingLevel,
                educationType: educationType,
                plannedEducationYear: Number(plannedEducationYear),
                feePerCredit: Number(feePerCredit),
                version : Number(version),
                majorId : Number(majorId),
            }
        })
        return {
            program
        }
    },
    updateProgramInfo: async (programId, data) => {
        validateMissingFields(data, ['name', 'trainingLevel', 'educationType', 'plannedEducationYear', 'feePerCredit', 'version', 'majorId'])
        const { name, trainingLevel, educationType, plannedEducationYear, feePerCredit, version, majorId } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chương trình không hợp lệ")
        }
        if (typeof trainingLevel !== 'string' || trainingLevel.trim() === '') {
            throw new BadrequestException("Tên bậc đào tạo không hợp lệ")
        }
        if (typeof educationType !== 'string' || educationType.trim() === '') {
            throw new BadrequestException("Tên hình thức đào tạo không hợp lệ")
        }
        if (!Number.isFinite(Number(plannedEducationYear))) {
            throw new BadrequestException("Năm đào tạo dự kiến không hợp lệ")
        }
        if (!Number.isInteger(Number(feePerCredit)) || Number(feePerCredit) < 0) {
            throw new BadrequestException("Số tiền cho một tín chỉ không hợp lệ")
        }
        if (!Number.isInteger(Number(version)) || Number(version) < 1) {
            throw new BadrequestException("Phiên bản chương trình không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException("Ngành không hợp lệ không hợp lệ")
        }
        const [program, major, programName] = await Promise.all([
            prisma.program.findUnique({ where: { id: Number(programId) } }),
            prisma.major.findUnique({ where: { id: Number(majorId) } }),
            prisma.program.findFirst({ where: { name: name.trim(), version: Number(version), majorId: Number(majorId), NOT: { id: Number(programId) } } })
        ])
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }
        if (programName) {
            throw new ConflictException("Chương trình của ngành này trong năm này đã tồn tại")
        }
        const updateProgramInfo = await prisma.program.update({
            where: { id: Number(programId) },
            data: {
                name: name.trim(),
                trainingLevel: Number(trainingLevel),
                educationType: Number(educationType),
                plannedEducationYear: Number(plannedEducationYear),
                version: Number(version),
                majorId: Number(majorId)
            }
        })
        return {
            updateProgramInfo
        }
    },
    updateProgramStatus: async (programId) => {

        const program = await prisma.program.findUnique({ where: { id: Number(programId) } })
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
        if (program.isActive === true) {
            const studentProgram = await prisma.student.count({ where: { programId: Number(programId) } })
            if (studentProgram > 0) {
                throw new BadrequestException("Không thể khóa chương trình đã có sinh viên")
            }
        }
        const updateProgramStatus = await prisma.program.update({
            where: { id: Number(programId) },
            data: {
                isActive: !program.isActive
            }
        })
        return {
            updateProgramStatus
        }
    },
    getAllPrograms: async (programName,page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(programName ? {name : {contains : programName.toLowerCase()}} : {})
        }
        const [programs, totalPrograms] = await Promise.all([
            prisma.program.findMany({
                where : whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'},
                include : {
                    major : {
                        select : {
                            name : true
                        }
                    }
                }
            }),
            prisma.program.count({
                where : whereCondition
            })
        ])
        return {
            programs,
            pagination : {
                page : Number(page),
                limit : limit,
                total : totalPrograms,
                totalPages : Math.ceil(totalPrograms/limit)
            }
        }
    },
    getAllProgramsSimple: async () => {
        const programs = await prisma.program.findMany({
            where : {isActive : true},
            select : {
                id : true,
                name : true,
                version : true,
                major : {
                    select : {
                        name : true
                    }
                }
            }
        })
        return {
            programs
        }
    }
}