import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const classService = {
    createClass: async (data) => {
        validateMissingFields(data, ['name', 'majorId'])
        const { name, majorId, homeroomLecturerId } = data

    
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên lớp không hợp lệ")
        }

   
        const mid = Number(majorId)
        if (!Number.isInteger(mid)) {
            throw new BadrequestException('MajorId không hợp lệ')
        }

        const major = await prisma.major.findUnique({
            where: { id: mid }
        })

        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }

    
        let lecturerId = null

        if (homeroomLecturerId !== null && homeroomLecturerId !== undefined) {

            lecturerId = Number(homeroomLecturerId)

            if (!Number.isInteger(lecturerId)) {
                throw new BadrequestException("Giảng viên không hợp lệ")
            }

            const lecturer = await prisma.lecturer.findUnique({
                where: { id: lecturerId }
            })

            if (!lecturer) {
                throw new NotFoundException("Không tìm thấy giảng viên")
            }

            if (lecturer.facultyId && lecturer.facultyId !== major.facultyId) {
                throw new BadrequestException("Giảng viên không thuộc khoa này")
            }

       
            const existingHomeroom = await prisma.class.findFirst({
                where: { homeroomLecturerId: lecturerId }
            })

            if (existingHomeroom) {
                throw new ConflictException("Giảng viên đã là GVCN của lớp khác")
            }
        }


        const existingClassName = await prisma.class.findFirst({
            where: { name: name.trim(), majorId: mid }
        })

        if (existingClassName) {
            throw new ConflictException("Đã tồn tại lớp học ở ngành này")
        }

        const created = await prisma.class.create({
            data: {
                name: name.trim(),
                majorId: mid,
                homeroomLecturerId: lecturerId
            }
        })

        return { created }
    },
    updateClassInfo: async (classId, data) => {
        const { name, majorId, homeroomLecturerId } = data

        const cid = Number(classId)
        const mid = Number(majorId)


        if (!Number.isInteger(cid)) {
            throw new BadrequestException("ClassId không hợp lệ")
        }

 
        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên lớp không hợp lệ")
        }


        if (!Number.isInteger(mid)) {
            throw new BadrequestException('MajorId không hợp lệ')
        }

 
        const existingClass = await prisma.class.findUnique({
            where: { id: cid }
        })

        if (!existingClass) {
            throw new NotFoundException("Không tìm thấy lớp")
        }

   
        const major = await prisma.major.findUnique({
            where: { id: mid }
        })

        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }

      
        let lecturerId = null

        if (homeroomLecturerId !== null && homeroomLecturerId !== undefined) {

            lecturerId = Number(homeroomLecturerId)

            if (!Number.isInteger(lecturerId)) {
                throw new BadrequestException("Giảng viên không hợp lệ")
            }

            const lecturer = await prisma.lecturer.findUnique({
                where: { id: lecturerId }
            })

            if (!lecturer) {
                throw new NotFoundException("Không tìm thấy giảng viên")
            }

      
            if (lecturer.facultyId && lecturer.facultyId !== major.facultyId) {
                throw new BadrequestException("Giảng viên không thuộc khoa này")
            }

      
            const existingHomeroom = await prisma.class.findFirst({
                where: {
                    homeroomLecturerId: lecturerId,
                    NOT: { id: cid }
                }
            })

            if (existingHomeroom) {
                throw new ConflictException("Giảng viên đã là GVCN của lớp khác")
            }
        }

       
        const duplicate = await prisma.class.findFirst({
            where: {
                name: name.trim(),
                majorId: mid,
                NOT: { id: cid }
            }
        })

        if (duplicate) {
            throw new ConflictException("Đã tồn tại lớp học ở ngành này")
        }

     
        const updated = await prisma.class.update({
            where: { id: cid },
            data: {
                name: name.trim(),
                majorId: mid,
                homeroomLecturerId: lecturerId
            }
        })

        return { updated }
    },
    updateClassStatus: async (classId) => {
        const [cls, hasStudent] = await Promise.all([
            prisma.class.findUnique({ where: { id: Number(classId) } }),
            prisma.student.findFirst({ where: { classId: Number(classId) } })
        ])
        if (!cls) {
            throw new NotFoundException("Không tìm thấy lớp học")
        }
        if (hasStudent) {
            throw new BadrequestException("Không thể tắt vì lớp còn sinh viên")
        }
        const updateClassStatus = await prisma.class.update({
            where: { id: Number(classId) },
            data: {
                isActive: !cls.isActive
            }
        })
        return {
            updateClassStatus
        }
    },
    getAllClasses: async (search, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = search ? {
            OR: [
                {
                    name: {
                        contains: search.toLowerCase()
                    }
                },
                {
                    homeroomLecturer: {
                        user: {
                            fullName: {
                                contains: search.toLowerCase()
                            }
                        }
                    }
                }
            ]
        } : {}
        const [classes, totalClasses] = await Promise.all([
            prisma.class.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                    major: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    homeroomLecturer: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                },
            }),
            prisma.class.count({
                where: whereCondition
            })
        ])
        return {
            classes,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalClasses,
                totalPage: Math.ceil(totalClasses / limit)
            }
        }

    },
    getAllClassesSimple: async () => {
        const classes = await prisma.class.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                major: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                homeroomLecturer: {
                    select: {
                        id: true,
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
            classes
        }
    },
    getClassesByFaculty: async (facultyId) => {
        const faculty = await prisma.faculty.findUnique({
            where: { id: Number(facultyId) },

        })
        if (!faculty) {
            throw new NotFoundException("Không tìm thấy khoa")
        }
        const classes = await prisma.class.findMany({
            where: {
                isActive: true,
                major: {
                    facultyId: Number(facultyId)
                }
            }
        })
        return {
            classes
        }
    },
    getClassesByProgram: async (programId) => {
        const program = await prisma.program.findUnique({
            where: { id: Number(programId) },
            include: {
                major: true
            }

        })
        if (!program) {
            throw new NotFoundException("Không tìm thấy chương trình")
        }
        const classes = await prisma.class.findMany({
            where: {
                isActive: true,
                majorId: Number(program.major.id)
            }
        })
        return {
            classes
        }
    }
}