import { BadrequestException, NotFoundException } from "../../common/helpers/exception.helper.js"
import prisma from "../../common/prisma/initPrisma.js"
import bcrypt from 'bcrypt'
export const resetService = {
    resetPassword: async (studentId, data) => {
        const { oldPassword, newPassword, confirmPassword } = data
        if (!oldPassword || !newPassword || !confirmPassword) {
            throw new BadrequestException("Thiếu thông tin mật khẩu");
        }
        if (newPassword !== confirmPassword) {
            throw new BadrequestException('Mật khẩu mới không giống mật khẩu xác nhận')
        }
        const user = await prisma.user.findUnique({
            where: { id: Number(studentId) }
        })
        if (!user) {
            throw new NotFoundException('Không tìm thấy sinh viên này ')
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if (!isMatch) {
            throw new BadrequestException("Mật khẩu cũ không đúng");
        }
        const hashPassword = await bcrypt.hash(newPassword, 10)

       await prisma.user.update({
            where: { id: Number(studentId) },
            data: {
                password: hashPassword
            }
        })

    }
}