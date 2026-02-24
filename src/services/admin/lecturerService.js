import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateEmail from "../../utils/validateEmail.js"
import validateMissingFields from "../../utils/validateFields.js"
import validatePassword from "../../utils/validatePassword.js"
import bcrypt from 'bcrypt'
export const lecturerService = {
    createLecturer: async (data, avatarPath) => {
        validateMissingFields(data, ['fullName', 'email', 'password', 'lecturerCode', 'majorId', 'gender'])
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

        const {
            fullName, email, lecturerCode, majorId, gender,
            degree, position, citizenId, personalEmail,
            placeOfBirth, ethnicity, address,
            dateOfBirth, phoneNumber, status
        } = data

        const lecturer = await prisma.lecturer.findUnique({
            where: { id: Number(lecturerId) },
            include: { user: true }
        })

        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
        }

        const updateUserData = {}
        const updateLecturerData = {}

        if (fullName !== undefined) {
            if (!fullName.trim()) throw new BadrequestException("Tên không hợp lệ")
            updateUserData.fullName = fullName.trim()
        }

        if (email !== undefined) {
            const trimmedEmail = email.trim()
            if (!trimmedEmail) {
                throw new BadrequestException("Email không được để trống")
            }
            validateEmail(email, "LECTURER")
            const existingEmail = await prisma.user.findFirst({
                where: {
                    email: email.trim(),
                    NOT: { id: lecturer.user.id }
                }
            })

            if (existingEmail) {
                throw new ConflictException("Email đã tồn tại")
            }

            updateUserData.email = email.trim()
        }

        if (gender !== undefined) {
            updateUserData.gender = gender
        }

        if (phoneNumber !== undefined) {
            updateUserData.phoneNumber = phoneNumber?.trim() || null
        }

        if (address !== undefined) {
            updateUserData.address = address?.trim() || null
        }

        if (dateOfBirth !== undefined) {
            updateUserData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
        }

        if (avatarPath) {
            updateUserData.avatar = avatarPath
        }

        if (lecturerCode !== undefined) {
            const existingCode = await prisma.lecturer.findFirst({
                where: {
                    lecturerCode: lecturerCode.trim(),
                    NOT: { id: Number(lecturerId) }
                }
            })

            if (existingCode) {
                throw new ConflictException("Mã giảng viên đã tồn tại")
            }

            updateLecturerData.lecturerCode = lecturerCode.trim()
        }

        if (majorId !== undefined) {
            const major = await prisma.major.findUnique({
                where: { id: Number(majorId) }
            })

            if (!major) {
                throw new NotFoundException("Không tìm thấy ngành")
            }

            updateLecturerData.majorId = Number(majorId)
            updateLecturerData.facultyId = major.facultyId
        }

        if (degree !== undefined) updateLecturerData.degree = degree
        if (position !== undefined) updateLecturerData.position = position
        if (status !== undefined) updateLecturerData.status = status

        if (citizenId !== undefined) updateLecturerData.citizenId = citizenId?.trim() || null
        if (personalEmail !== undefined) {
            const trimmedEmail = personalEmail?.trim()

            if (!trimmedEmail) {
                updateLecturerData.personalEmail = null
            } else {
                if (!trimmedEmail.endsWith('@gmail.com')) {
                    throw new BadrequestException("Email cá nhân phải là gmail")
                }

                updateLecturerData.personalEmail = trimmedEmail
            }
        }
        if (placeOfBirth !== undefined) updateLecturerData.placeOfBirth = placeOfBirth?.trim() || null
        if (ethnicity !== undefined) updateLecturerData.ethnicity = ethnicity?.trim() || null

        const updateLecturerInfo = await prisma.user.update({
            where: { id: lecturer.user.id },
            data: {
                ...updateUserData,
                lecturer: {
                    update: updateLecturerData
                }
            },
            include: {
                lecturer: true
            }
        })

        return { updateLecturerInfo }
    },
    updateLecturerStatusActive: async (lecturerId) => {
        const lecturer = await prisma.lecturer.findUnique({
            where: { id: Number(lecturerId) },
            include: {
                user: true
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
    getAllLecturers: async (lecturerCode, lecturerName, majorName,facultyName, page) => {
        const limit = 10
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
    role: 'LECTURER',

    ...(lecturerName ? {
        fullName: {
            contains: lecturerName.toLowerCase(),
        }
    } : {}),

    lecturer: {
        ...(lecturerCode ? {
            lecturerCode: {
                contains: lecturerCode.toLowerCase(),
            }
        } : {}),

        ...(majorName ? {
            major: {
                name: {
                    contains: majorName.toLowerCase(),
                }
            }
        } : {}),

        ...(facultyName ? {
            major: {
                faculty: {
                    name: {
                        contains: facultyName.toLowerCase(),
                    }
                }
            }
        } : {})
    }
}
        const [lecturers, totalLecturers] = await prisma.$transaction([
            prisma.user.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    fullName: true,
                    email: true,
                    avatar: true,
                    gender: true,
                    dateOfBirth: true,
                    phoneNumber: true,
                    address: true,
                    lecturer: {
                        select: {
                            id: true,
                            lecturerCode: true,
                            personalEmail: true,
                            citizenId: true,
                            placeOfBirth: true,
                            ethnicity: true,
                            degree: true,
                            position: true,
                            status: true,
                            faculty: {
                                select: {
                                    name: true
                                }
                            },
                            major: {
                                select: {
                                    name: true
                                }
                            }

                        }
                    }
                }
            }),
            prisma.user.count({
                where: whereCondition
            })
        ])
        return {
            lecturers,
            pagination: {
                page: Number(page),
                limit: limit,
                total: totalLecturers,
                totalPages: Math.ceil(totalLecturers / limit)
            }
        }
    },
    getAllLecturersSimple: async () => {
        const lecturers = await prisma.user.findMany({
            where: { role: 'LECTURER', isActive: true },
            select: {
                fullName: true,
                lecturer: {
                    select: {
                        id: true,
                        lecturerCode: true,
                        major: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
        return {
            lecturers
        }
    },
    resetPasswordLecturer: async (lecturerId, data) => {
        validateMissingFields(data, ['newPassword'])

        const { newPassword } = data
        if (typeof newPassword !== 'string' || newPassword.trim() === '') {
            throw new BadrequestException("Mật khẩu không hợp lệ")
        }
        validatePassword(newPassword)

        const lecturer = await prisma.lecturer.findUnique({
            where: { id: Number(lecturerId) },
            include: {
                user: true
            }
        })
        if (!lecturer) {
            throw new NotFoundException("Không tìm thấy giảng viên")
        }
        const hashpasword = await bcrypt.hash(newPassword, 10)
        const resetPasswordLecturer = await prisma.user.update({
            where: { id: lecturer.user.id },
            data: {
                password: hashpasword
            }
        })
        return {
            resetPasswordLecturer
        }
    },
    getlecturersByFaculty: async (facultyId) => {
        const lecturers = await prisma.lecturer.findMany({
            where: {
                facultyId: Number(facultyId),
                status: 'WORKING',
                user: {
                    isActive: true
                }
            },
            select: {
                id: true,
                user: {
                    select: {
                        fullName: true
                    }
                }
            }
        })
        return {
            lecturers
        }
    },
    // getAllRequestPassued

} 