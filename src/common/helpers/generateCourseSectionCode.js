import prisma from "../prisma/initPrisma.js"

const generateCourseSectionCode = async () => {
    let code
    let exist = true
    while(exist) {
        code = Math.floor(100000000000 + Math.random() * 900000000000).toString()
        exist = await prisma.courseSection.findUnique({where : {sectionCode : code}})
    }
    return code
}
export default generateCourseSectionCode
