import slugify from "slugify";

const generateProgramCode = (name) => {
    const programCode = slugify(name, {
        replacement: ' ',
        lower: false,
        upper: true,
        strict: true,
        locale: 'vi'
    })
    const shortProgramCode = programCode.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase();
    return `CT-${shortProgramCode}`;
}
export default generateProgramCode