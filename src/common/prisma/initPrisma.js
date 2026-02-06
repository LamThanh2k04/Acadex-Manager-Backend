import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

try {
   await prisma.$queryRaw`SELECT 1+1 AS RESULT`;
   console.log("Prisma : Kết nối thành công")
} catch (err) {
    console.log("Prisma: Kết nối thất bại", err)
}
export default prisma;