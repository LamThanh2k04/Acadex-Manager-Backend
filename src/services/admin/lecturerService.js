import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateEmail from "../../utils/validateEmail.js"
import validateMissingFields from "../../utils/validateFields.js"
import validatePassword from "../../utils/validatePassword.js"
import bcrypt from 'bcrypt'
export const lecturerService = {
    createLecturer: async (data, avatarPath) => {
        validateMissingFields(data, ['fullName', 'email', 'password', 'lecturerCode', 'majorId','gender'])
        const { fullName, email, password, lecturerCode, majorId, gender } = data
        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException("Tên không hợp lệ")
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException("Email không hợp lệ")
        }
        if (typeof password !== 'string' || password.trim() === '') {
            throw new BadrequestException("Mật khẩu không hợp lệ")
        }
        if (typeof lecturerCode !== 'string' || lecturerCode.trim() === '') {
            throw new BadrequestException("Mã giảng viên không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException("MajorId không hợp lệ")
        }
        if (typeof gender !== 'string' || gender.trim() === '') {
            throw new BadrequestException("Giới tính không hợp lệ")
        }
        validateEmail(email, "LECTURER")
        validatePassword(password)

        const existingEmail = await prisma.user.findUnique({
            where: { email: email.trim() }
        })
        if (existingEmail) {
            throw new ConflictException("Email đã tồn tại")
        }
        const existingLecturerCode = await prisma.lecturer.findUnique({
            where: { lecturerCode: lecturerCode.trim() }
        })
        if (existingLecturerCode) {
            throw new ConflictException("Mã giảng viên đã tồn tại")
        }
        const major = await prisma.major.findUnique({
            where: { id: Number(majorId) }
        })
        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành")
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const lecturer = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                password: hashPassword,
                gender: gender.trim(),
                avatar: avatarPath || null,
                role: 'LECTURER',
                lecturer: {
                    create: {
                        lecturerCode: lecturerCode.trim(),
                        majorId: Number(majorId),
                        facultyId: major.facultyId
                    }
                }
            },
            include: {
                lecturer: {
                    select: {
                        id: true,
                        lecturerCode: true,
                        majorId: true,
                        facultyId: true
                    }
                }
            }
        })
        return {
            lecturer
        }
    },
    updateLecturerInfo: async (lecturerId, data, avatarPath) => {
        const { fullName, email, lecturerCode, majorId, gender, degree, position, citizenId, personalEmail, placeOfBirth, ethnicity, address, dateOfBirth, phoneNumber } = data
        const parsedDateOfBirth = new Date(dateOfBirth)
        if (typeof fullName !== 'string' || fullName.trim() === '') {
            throw new BadrequestException("Tên không hợp lệ")
        }
        if (typeof email !== 'string' || email.trim() === '') {
            throw new BadrequestException("Email không hợp lệ")
        }
        if (typeof lecturerCode !== 'string' || lecturerCode.trim() === '') {
            throw new BadrequestException("Mã giảng viên không hợp lệ")
        }
        if (!Number.isInteger(Number(majorId))) {
            throw new BadrequestException("MajorId không hợp lệ")
        }
        if (typeof gender !== 'string' || gender.trim() === '') {
            throw new BadrequestException("Giới tính không hợp lệ")
        }
        const lecturer = await prisma.lecturer.findUnique({
            where: { id: Number(lecturerId) },
            include: {
                user: true
            }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
        }
        const exstingEmail = await prisma.user.findUnique({
            where: { email: email.trim(), NOT: { id: lecturer.user.id } }
        })
        if (exstingEmail) {
            throw new ConflictException("Đã tồn tại email giảng viên")
        }
        const existingLecturerCode = await prisma.lecturer.findUnique({
            where: { lecturerCode: lecturerCode.trim(), NOT: { id: Number(lecturerId) } }
        })
        if (existingLecturerCode) {
            throw new ConflictException("Đã tồn tại mã giảng viên")
        }
        const major = await prisma.major.findUnique({
            where: { id: Number(majorId) }
        })
        if (!major) {
            throw new NotFoundException("Không tìm thấy ngành này")
        }
        const updateLecturer = await prisma.user.update({
            where: { id: lecturer.user.id },
            data: {
                fullName: fullName.trim(),
                email: email.trim(),
                gender: gender,
                avatar: avatarPath ? avatarPath : null,
                dateOfBirth: dateOfBirth ? parsedDateOfBirth : null,
                phoneNumber: phoneNumber ? phoneNumber.trim() : null,
                address: address ? address.trim() : null,
                lecturer: {
                    update: {
                        lecturerCode: lecturerCode.trim(),
                        majorId: Number(majorId),
                        facultyId: major.facultyId,
                        degree: degree,
                        position: position,
                        citizenId: citizenId ? citizenId.trim() : null,
                        placeOfBirth: placeOfBirth ? placeOfBirth.trim() : null,
                        personalEmail: personalEmail ? personalEmail.trim() : null,
                        ethnicity: ethnicity ? ethnicity.trim() : null
                    }
                }
            }
        })
        return {
            updateLecturer
        }
    },
    updateLecturerStatus: async (lecturerId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { id: Number(lecturerId) },
            include : {
                user : true
            }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên này")
        }
        const updateLecturerStatus = await prisma.lecturer.update({
            where: { id: Number(lecturerId) },
            data: {
                user: {
                    update: {
                        isActive: !lecturer.user.isActive
                    }
                }
            },
            include: {
                user: {
                    select: {
                        isActive: true
                    }
                }
            }
        })
        return {
            updateLecturerStatus
        }
    },
    getAllLecturers: async (lecturerCode, lecturerName, majorName, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            role: 'LECTURER',
            ...(lecturerCode ? {
                leturer: {
                    lecturerCode: { contains: lecturerCode.toLowerCase() }
                }
            } : {}),
            ...(lecturerName ? {
                fullName: { contains: lecturerName.toLowerCase() }
            } : {}),
            ...(lecturerCode ? {
                leturer: {
                    major: {
                        name: { contains: majorName.toLowerCase() }
                    }
                }
            } : {}),
        }
        const [lecturers, totalLecturers] = await prisma.$transaction([
             prisma.user.findMany({
                where : whereCondition,
                take : limit,
                skip : skip,
                orderBy : {createdAt : 'desc'},
                include : {
                    lecturer : true
                }
            }),
             prisma.user.count({
                where : whereCondition
            })
        ])
        return {
            lecturers,
            pagination : {
                page : Number(page),
                limit : limit,
                total : totalLecturers,
                totalPages : Math.ceil(totalLecturers/limit)
            }
        }
    },
    getAllLecturersSimple : async () => {
        const lecturers = await prisma.user.findMany({
            where : {role : 'LECTURER',isActive: true},
            select: {
                fullName : true,
                lecturer : {
                    select : {
                        id : true,
                        lecturerCode : true,
                        major : {
                            select : {
                                id : true,
                                name : true
                            }
                        }
                    }
                }
            }
        })
        return {
            lecturers
        }
    }

} 