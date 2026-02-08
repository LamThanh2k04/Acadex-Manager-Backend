import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const programService = {
    createProgram: async (data) => {
        validateMissingFields(data, ['name', 'trainingLevel', 'educationType', 'plannedEducationYear', 'feePerCredit',])
        const { name, trainingLevel, educationType, plannedEducationYear, feePerCredit } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chương trình không hợp lệ")
        }
        if (typeof trainingLevel !== 'string' || trainingLevel.trim() === '') {
            throw new BadrequestException("Tên bậc đào tạo không hợp lệ")
        }
        if (typeof educationType !== 'string' || educationType.trim() === '') {
            throw new BadrequestException("Tên hình thức đào tạo không hợp lệ")
        }
        if(!Number.isFinite(Number(plannedEducationYear))) {
            throw new BadrequestException("Năm đào tạo dự kiến không hợp lệ")
        }
        if(!Number.isInteger(Number(feePerCredit))) {
            throw new BadrequestException("Số tiền cho một tín chỉ không hợp lệ")
        }
        const programName = await prisma.program.findFirst({
            where : {name : name.trim()}
        })
        if(programName) {
            throw new ConflictException("Tên chương trình đã tồn tại")
        }
        const program = await prisma.program.create({
            data : {
                name : name.trim(),
                trainingLeve : trainingLevel,
                educationType : educationType,
                plannedEducationYear : Number(plannedEducationYear),
                feePerCredit : Number(feePerCredit)
            }
        })
        return {
            program
        }
    },
    updateProgramInfo: async (programId, data) => {
        validateMissingFields(data, ['name', 'trainingLevel', 'educationType', 'plannedEducationYear', 'feePerCredit',])
        const { name, trainingLevel, educationType, plannedEducationYear, feePerCredit } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chương trình không hợp lệ")
        }
        if (typeof trainingLevel !== 'string' || trainingLevel.trim() === '') {
            throw new BadrequestException("Tên bậc đào tạo không hợp lệ")
        }
        if (typeof educationType !== 'string' || educationType.trim() === '') {
            throw new BadrequestException("Tên hình thức đào tạo không hợp lệ")
        }
        if(!Number.isFinite(Number(plannedEducationYear))) {
            throw new BadrequestException("Năm đào tạo dự kiến không hợp lệ")
        }
        if(!Number.isInteger(Number(feePerCredit))) {
            throw new BadrequestException("Số tiền cho một tín chỉ không hợp lệ")
        }
        const [program,programName] = await Promise.all([
            prisma.program.findUnique({where : {id : Number(programId)}}),
            prisma.program.findFirst({where : {name : name.trim()}})
        ])
        if(!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
         if(programName) {
            throw new ConflictException("Tên chương trình đã tồn tại")
        }
        // const 
    },
    updateProgramStatus: async (programId) => {

    },
    getAllPrograms: async () => {

    },
    getAllProgramsSimple: async () => {

    }
}