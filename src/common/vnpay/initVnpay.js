import {VNPay,ignoreLogger} from 'vnpay'

const vnpay = new VNPay({
  tmnCode: process.env.TMNCODE,
  secureSecret: process.env.SECURESECRET,
  vnpayHost: process.env.VNPAYHOST,
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger
})

export default vnpay