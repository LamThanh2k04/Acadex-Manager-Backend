import slugify from "slugify";

const generateCertificateCode = (name) => {
    const certificateCode = slugify(name, {
        replacement: ' ',
        lower: false,
        upper: true,
        strict: true,
        locale: 'vi'
    })
    const shortCertificateCode = certificateCode.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase();
    return `CC-${shortCertificateCode}`;
}
export default generateCertificateCode