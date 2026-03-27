import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const certificateService = {
    getAllCertificatesProgram: async (studentId) => {

        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            include: {
                program: true,
                certificates : true
            }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }

        if (!student.program) {
            throw new BadrequestException("Sinh viên chưa có chương trình đào tạo")
        }

        const programCertificates = await prisma.programCertificate.findMany({
            where: {
                programId: student.program.id,
                template: {
                    isActive: true
                }
            },
            select: {
                template: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        })
        const studentCertificates = student.certificates.filter((cer) => cer.status === 'PENDING' || cer.status === 'ISSUED').map((cer) => cer.templateId)
        const certificates = programCertificates.filter((c) => {
           return !studentCertificates.includes(c.template.id)
        })

        return {
            certificates
        }
    },
    getCertificatesProgram: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) },
            select: {
                id: true,
                program: {
                    select: {
                        programCertificates: {
                            select: {
                                template: {
                                    select: {
                                        id: true,
                                        name: true,
                                        description: true
                                    }
                                }
                            }
                        }
                    }
                },
                certificates: {
                    select: {
                        templateId: true,
                        status: true,
                        fileUrl: true
                    }
                }
            }
        })

        if (!student) {
            throw new NotFoundException("Không tìm thấy sinh viên")
        }
        const result = student.program.programCertificates.map(item => {
            const template = item.template

            const studentCert = student.certificates.find(
                cert => cert.templateId === template.id && cert.status === 'ISSUED'
            )
            return {
                // student,
                name: template.name,
                description: template.description || template.name,
                submit: studentCert ? true : false,
                status: studentCert
                    ? (studentCert.status === "ISSUED" ? "Hoàn tất" : "Chưa hoàn tất")
                    : "Chưa hoàn tất"
            }
        })
        return {
            result
        }
    },
    submitCertificate: async (studentId, imageCertificate, data) => {
        validateMissingFields(data,['templateId','issueDate'])
        const { templateId, issueDate, description } = data
        if(!imageCertificate) {
            throw new BadrequestException("Vui lòng tải lên ảnh chứng chỉ")
        }
        const student = await prisma.student.findUnique({
            where: { userId: Number(studentId) }
        })

        if (!student) {
            throw new NotFoundException('Không tìm thấy sinh viên')
        }

        const template = await prisma.certificateTemplate.findUnique({
            where: { id: Number(templateId) }
        })

        if (!template) {
            throw new NotFoundException("Không tìm thấy chứng chỉ")
        }

        
        const pendingRequest = await prisma.certificate.findFirst({
            where: {
                studentId: student.id,
                templateId: Number(templateId),
                status: "PENDING"
            }
        })

        if (pendingRequest) {
            throw new BadrequestException("Yêu cầu đang chờ duyệt")
        }

       
        const approved = await prisma.certificate.findFirst({
            where: {
                studentId: student.id,
                templateId: Number(templateId),
                status: "ISSUED"
            }
        })

        if (approved) {
            throw new BadrequestException("Chứng chỉ đã được duyệt")
        }

        const submitCertificate = await prisma.certificate.create({
            data: {
                fileUrl: imageCertificate ?? null,
                studentId: student.id,
                templateId: Number(templateId),
                issueDate: issueDate ? new Date(issueDate) : null,
                description: description ?? null,
                status: "PENDING"
            }
        })
        return {
            submitCertificate
        }
    },
    getAllCertificatesStudent: async (studentId) => {
        const student = await prisma.student.findUnique({
            where: { userId: studentId }
        })
        if (!student) {
            throw new NotFoundException('Không tìm thấy sinh viên này')
        }
        const certificates = await prisma.certificate.findMany({
            where: { studentId: student.id },
            select: {
                fileUrl: true,
                issueDate: true,
                description: true,
                status: true,
                checkedAt: true,
                note: true,
                template: {
                    select: {
                        code: true,
                        name: true,
                    }
                },
                admin: {
                    select: {
                        fullName: true
                    }
                }
            }
        })
        return {
            certificates
        }

    }
}