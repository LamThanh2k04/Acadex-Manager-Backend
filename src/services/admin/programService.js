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
                version: Number(version),
                majorId: Number(majorId),
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
    getAllPrograms: async (programName, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(programName ? { name: { contains: programName.toLowerCase() } } : {})
        }
        const [programs, totalPrograms] = await Promise.all([
            prisma.program.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    major: {
                        select: {
                            name: true
                        }
                    }
                }
            }),
            prisma.program.count({
                where: whereCondition
            })
        ])
        return {
            programs,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalPrograms,
                totalPages: Math.ceil(totalPrograms / limit)
            }
        }
    },
    getAllProgramsSimple: async () => {
        const programs = await prisma.program.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                version: true,
                major: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return {
            programs
        }
    },
    getProgramInfo: async (programId) => {
        const program = await prisma.program.findUnique({
            where: { id: Number(programId) },
            include: {
                programSubjects: {
                    select: {
                        id: true,
                        feePerCredit: true,
                        semesterOrder: true,
                        subject: true
                    }
                },
                programCertificates: {
                    select: {
                        template: true
                    }
                }
            }
        })
        if (!program) {
            throw new NotFoundException("Không tìm thấy thông tin chương trình")
        }
        return {
            program
        }
    },
    addSubjectToProgram: async (programId, data) => {
        validateMissingFields(data, ['subjectIds', 'type'])
        const { semesterOrder, type, feePerCredit, subjectIds } = data

        if (!Number.isInteger(Number(programId))) {
            throw new BadrequestException("programId không hợp lệ")
        }
        if (!Number.isInteger(Number(semesterOrder))) {
            throw new BadrequestException("Học kì không hợp lệ")
        }
        if (typeof type !== 'string' || type.trim() === '') {
            throw new BadrequestException("Loại môn không hợp lệ")
        }
        if (
            feePerCredit !== null &&
            feePerCredit !== undefined &&
            !Number.isInteger(Number(feePerCredit))
        ) {
            throw new BadrequestException("Tiền cho 1 tín chỉ không hợp lệ");
        }
        if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
            throw new BadrequestException("Subjects phải là mảng và không được rỗng")
        }
        return await prisma.$transaction(async (tx) => {
            const program = await tx.program.findUnique({
                where: { id: Number(programId) }
            })

            if (!program) {
                throw new NotFoundException("Không tìm thấy chương trình")
            }
            const sb = await tx.subject.findMany({
                where: { id: { in: subjectIds.map(Number) } }
            })
            if (sb.length !== subjectIds.length) {
                throw new BadrequestException("Có môn không tồn tại")
            }
            const existingSubjects = await tx.programSubject.findMany({
                where: {
                    programId: Number(programId),
                    subjectId: { in: subjectIds.map(Number) }
                },
                select: {
                    semesterOrder : true,
                    subject: { select: { name: true } }
                }
            })

            if (existingSubjects.length > 0) {
                const names = existingSubjects.map(e => e.subject.name)
                throw new BadrequestException(
                    `Các môn đã tồn tại trong chương trình: ${names.join(", ")} ở kì:${existingSubjects[0].semesterOrder}`
                )
            }
            const insertData = subjectIds.map(subjectId => ({
                programId: Number(programId),
                subjectId: Number(subjectId),
                semesterOrder: Number(semesterOrder),
                type: type,
                feePerCredit: feePerCredit ?? null
            }))
            await tx.programSubject.createMany({
                data: insertData
            })
            const subjects = await tx.programSubject.findMany({
                where: {
                    programId: Number(programId),
                    isActive: true
                },
                select: {
                    subject: {
                        select: { credits: true }
                    }
                }
            })

            const totalCredits = subjects.reduce(
                (sum, s) => sum + (s.subject?.credits || 0),
                0
            )
            await tx.program.update({
                where: { id: Number(programId) },
                data: {
                    totalCredits: totalCredits
                }
            })
        })
    },
    updateSubjectToProgram: async (programSubjectId, data) => {

        validateMissingFields(data, ['type', 'isActive', 'semesterOrder'])

        if (!Number.isInteger(Number(programSubjectId))) {
            throw new BadrequestException("ProgramSubject không hợp lệ")
        }

        const { type, isActive, semesterOrder, feePerCredit } = data

        if (typeof isActive !== 'boolean') {
            throw new BadrequestException("Trạng thái isActive không hợp lệ")
        }

        if (!Number.isInteger(Number(semesterOrder))) {
            throw new BadrequestException("Học kỳ không hợp lệ")
        }

        if (
            feePerCredit !== null &&
            feePerCredit !== undefined &&
            !Number.isInteger(Number(feePerCredit))
        ) {
            throw new BadrequestException("FeePerCredit không hợp lệ")
        }

        return await prisma.$transaction(async (tx) => {

            const ps = await tx.programSubject.findUnique({
                where: { id: Number(programSubjectId) },
                include: { program: true }
            })

            if (!ps) {
                throw new NotFoundException("Không tìm thấy môn trong chương trình")
            }

            const oldIsActive = ps.isActive

            const updateSubjectToProgram = await tx.programSubject.update({
                where: { id: ps.id },
                data: {
                    type,
                    isActive,
                    semesterOrder: Number(semesterOrder),
                    feePerCredit: feePerCredit ?? null
                }
            })

            if (oldIsActive !== isActive) {

                const subjects = await tx.programSubject.findMany({
                    where: {
                        programId: ps.programId,
                        isActive: true
                    },
                    select: {
                        subject: {
                            select: { credits: true }
                        }
                    }
                })

                const totalCredits = subjects.reduce(
                    (sum, s) => sum + (s.subject?.credits || 0),
                    0
                )

                await tx.program.update({
                    where: { id: ps.programId },
                    data: {
                        totalCredits: totalCredits
                    }
                })
            }

            return updateSubjectToProgram
        })
    },
    addCertificateToProgram: async (programId, data) => {
        validateMissingFields(data, ['certificateIds'])
        const { certificateIds } = data

        if (!Number.isInteger(Number(programId))) {
            throw new BadrequestException("Chương trình không hợp lệ")
        }
        if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
            throw new BadrequestException("Danh sách chứng chỉ không hợp lệ")
        }
        return await prisma.$transaction(async (tx) => {
            const program = await tx.program.findUnique({
                where: { id: Number(programId) }
            })

            if (!program) {
                throw new NotFoundException("Không tìm thấy chương trình")
            }

            const certs = await tx.certificateTemplate.findMany({
                where: { id: { in: certificateIds.map(Number) } }
            })

            if (certs.length !== certificateIds.length) {
                throw new NotFoundException("Có chứng chỉ không tồn tại")
            }
            const existingCertificate = await tx.programCertificate.findMany({
                where: {
                    programId: Number(programId),
                    templateId: { in: certificateIds.map(Number) }
                },
                include: {
                    template: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            if (existingCertificate.length > 0) {
                const names = existingCertificate.map(e => e.certificate.name)
                throw new BadrequestException(
                    `Chứng chỉ đã tồn tại: ${names.join(", ")}`
                )
            }
            const insertData = certificateIds.map(certificateId => ({
                programId: Number(programId),
                templateId: Number(certificateId)
            }))
            await tx.programCertificate.createMany({
                data: insertData
            })
        })
    },
    updateCertificateToProgram: async (programCertificateId) => {

        if (!Number.isInteger(Number(programCertificateId))) {
            throw new BadrequestException("ProgramCertificate không hợp lệ")
        }
        const programCertificate = await prisma.programCertificate.findUnique({
            where: { id: Number(programCertificateId) }
        })
        if (!programCertificate) {
            throw new NotFoundException("Không tìm thấy chứng chỉ trong chương trình")
        }

        const updateCertificateToProgram = await prisma.programCertificate.update({
            where: { id: Number(programCertificateId) },
            data: {
                isActive: !programCertificate.isActive
            }
        })
        return {
            updateCertificateToProgram
        }
    },
    getSemesterOrdersPrgram: async (programId) => {

        const [program, semesterOrder] = await Promise.all([
            prisma.program.findUnique({
                where: { id: Number(programId) }
            }),
            prisma.programSubject.findMany({
                where: { programId: Number(programId) },
                distinct: ['semesterOrder'],
                select: {
                    semesterOrder: true
                },
                orderBy: { createdAt: 'asc' }
            })
        ])
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
        return {
            semesterOrder
        }
    },
    getSubjectsBySemesterOrder: async (programId, semesterOrderId) => {
        const [program, subjects] = await Promise.all([
            prisma.program.findUnique({
                where: { id: Number(programId) }
            }),
            prisma.programSubject.findMany({
                where: { programId: Number(programId), semesterOrder: Number(semesterOrderId) },
                select: {
                    semesterOrder : true,
                    subject: {
                        select: {
                            id: true,
                            code : true,
                            name: true,
                            credits : true
                        }
                    }
                },
                orderBy: { id: 'asc' }
            })
        ])
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
        return {
            subjects
        }
    },

}