import prisma from "../prisma/initPrisma.js"

const generateSubjectCode = async () => {
    let code
    let exist = true
    while(exist) {
        code = Math.floor(100000 + Math.random() * 900000).toString()
        exist = await prisma.subject.findUnique({where : code})
    }
    return code
}
export default generateSubjectCode