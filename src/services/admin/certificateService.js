import { BadrequestException, ConflictException, NotFoundException } from "../../common/helpers/exception.helper.js"
import generateCertificateCode from "../../common/helpers/generateCertificateCode.js"
import prisma from "../../common/prisma/initPrisma.js"
import validateMissingFields from "../../utils/validateFields.js"

export const certificateService = {
    createCertificate: async (data) => {
        validateMissingFields(data, ['name'])
        const { name, description } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chứng chỉ không hợp lệ")
        }
        const certificationName = await prisma.certificateTemplate.findFirst({
            where: { name: name.trim() }
        })
        if (certificationName) {
            throw new ConflictException("Đã tồn tại tên chững chỉ")
        }
        const baseCode = generateCertificateCode(name.trim())
        let certificateCode = baseCode;
        let index = 1;
        while (await prisma.certificateTemplate.findUnique({ where: { code: certificateCode } })) {
            certificateCode = `${baseCode}-${index}`
            index++
        }
        const certificate = await prisma.certificateTemplate.create({
            data: {
                code: certificateCode,
                name: name.trim(),
                description: description.trim() || ""
            }
        })
        return {
            certificate
        }

    },
    updateCertificateInfo: async (certificateId, data) => {
        validateMissingFields(data, ['name'])
        const { name, description } = data

        if (typeof name !== 'string' || name.trim() === '') {
            throw new BadrequestException("Tên chứng chỉ không hợp lệ")
        }

        const [certificate, certificationName] = await Promise.all([
            prisma.certificateTemplate.findUnique({ where: { id: Number(certificateId) } }),
            prisma.certificateTemplate.findFirst({ where: { name: name.trim() ,NOT : {id : Number(certificateId)} } })
        ])
        if (!certificate) {
            throw new NotFoundException("Không tìm thấy chứng chỉ")
        }
        if (certificationName) {
            throw new ConflictException("Đã tồn tại tên chững chỉ")
        }
        const updateCertificationInfo = await prisma.certificateTemplate.update({
            where: { id: Number(certificateId) },
            data: {
                name: name.trim(),
                description: description.trim() || ""
            }
        })
        return {
            updateCertificationInfo
        }
    },
    updateCertificateStatus: async (certificateId) => {
        const certificate = await prisma.certificateTemplate.findUnique({ where: { id: Number(certificateId) } })
        if (!certificate) {
            throw new NotFoundException("Không tìm thấy chứng chỉ")
        }
        const updateCertificateStatus = await prisma.certificateTemplate.update({
            where: { id: Number(certificateId) },
            data: {
                isActive: !certificate.isActive
            }
        })
        return {
            updateCertificateStatus
        }
    },
    getAllCertificates: async (certificateName, page) => {
        const limit = 10;
        const skip = (Number(page) - 1) * limit
        const whereCondition = {
            ...(certificateName ? { name: { contains: certificateName.toLowerCase() } } : {})
        }
        const [certificates, totalCertificates] = await Promise.all([
            prisma.certificateTemplate.findMany({
                where: whereCondition,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.certificateTemplate.count({
                where : whereCondition
            })
        ])
        return {
            certificates,
            pagination : {
                page : Number(page),
                limit : limit,
                total : totalCertificates,
                totalPage : Math.ceil(totalCertificates/limit)
            }
        }
    },
    getAllCertificatesSimple: async () => {
        const certificates = await prisma.certificateTemplate.findMany({
            where : {isActive : true},
            orderBy : {createdAt : 'desc'},
            select : {
                id : true,
                name: true,
                description : true
            }
        })
        return {
            certificates
        }
    }
}