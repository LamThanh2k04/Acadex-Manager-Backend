import PdfPrinter from "pdfmake/src/printer.js"
import path from "path"
import { dashboardService } from "../admin/dashboardService.js"
import { chartService } from "../admin/chartService.js"

const fonts = {
  Roboto: {
    normal: path.resolve("src/common/font/Roboto-Regular.ttf"),
    bold: path.resolve("src/common/font/Roboto-Bold.ttf"),
  }
}

const printer = new PdfPrinter(fonts)


const createSection = (title) => ([
  {
    text: title,
    style: "sectionTitle"
  },
  {
    canvas: [
      {
        type: "rect",
        x: 0, y: 0, w: 515, h: 0.5,
        color: "#FDBA74"
      }
    ],
    margin: [0, 6, 0, 12]
  }
])



const createTable = (headers, rows) => ({
  table: {
    headerRows: 1,
    widths: Array(headers.length).fill("*"),
    body: [
      headers.map(h => ({ text: h, style: "tableHeader" })),
      ...rows.map((row, i) =>
        row.map(cell => ({
          text: String(cell),
          fillColor: i % 2 === 0 ? "#FFF7ED" : null
        }))
      )
    ]
  },
  layout: {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#FED7AA",
    vLineColor: () => "#FED7AA",
    paddingLeft: () => 10,
    paddingRight: () => 10,
    paddingTop: () => 7,
    paddingBottom: () => 7
  },
  margin: [0, 6, 0, 20]
})

const formatNumber = (n) =>
  new Intl.NumberFormat("vi-VN").format(n)

const toBase64Image = (buffer) =>
  `data:image/png;base64,${buffer.toString("base64")}`

export const reportService = {
  async exportReportPdf(year, res) {

    const overview = await dashboardService.getOverViewFull()
    const gender = await dashboardService.getTotalGenders()
    const passfail = await dashboardService.getPassFailStatus()
    const revenue = await dashboardService.getRevenueAllTimeByMonth()
    const topStudents = await dashboardService.getTopStudentGpa()

    const genderChart = await chartService.genderPie(gender)
    const passFailChart = await chartService.passFailPie(passfail)
    const revenueChart = await chartService.revenueLineAuto(revenue.result)

    const genderTotal = gender.total || 1
    const passTotal = passfail.total || 1
    const years = [...new Set(revenue.result.map(m => m.month.slice(0, 4)))]
    const isOneYear = years.length === 1

    let revenueTitle = ""
    let tableHeaders = []
    let tableRows = []

    if (isOneYear) {
      const year = years[0]
      const monthMap = {}
      revenue.result.forEach(m => monthMap[m.month] = m.total)

      revenueTitle = `IV. Doanh thu toàn hệ thống theo tháng năm ${year}`
      tableHeaders = ["Tháng", "Doanh thu"]

      tableRows = []
      for (let i = 1; i <= 12; i++) {
        const key = `${year}-${String(i).padStart(2, '0')}`
        tableRows.push([key, formatNumber(monthMap[key] || 0)])
      }

    } else {
      const yearMap = {}

      revenue.result.forEach(m => {
        const y = m.month.slice(0, 4)
        if (!yearMap[y]) yearMap[y] = 0
        yearMap[y] += m.total
      })

      revenueTitle = "IV. Doanh thu toàn hệ thống theo năm"
      tableHeaders = ["Năm", "Doanh thu"]
      tableRows = Object.entries(yearMap).map(
        ([y, total]) => [y, formatNumber(total)]
      )
    }
    const doc = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      defaultStyle: { font: "Roboto" },

      content: [

        {
          stack: [
            { text: "BÁO CÁO TỔNG QUAN HỆ THỐNG", style: "header" },
            {
              columns: [
                { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: "meta" },
                { text: `Năm thống kê: ${year}`, alignment: "right", style: "meta" }
              ]
            }
          ],
          margin: [0, 0, 0, 25]
        },


        ...createSection("I. Tổng quan hệ thống"),
        createTable(
          ["Chỉ số", "Giá trị"],
          [
            ["Tổng doanh thu", formatNumber(overview.totalRevenue) + " VND"],
            ["Tổng sinh viên", overview.totalStudents],
            ["Tổng giảng viên", overview.totalLecturers],
            ["Tổng lớp học phần", overview.totalCourses],
            ["Tổng môn học", overview.totalSubjects],
            ["Tổng khoa", overview.totalFaculties],
            ["Tổng ngành", overview.totalMajors],
            ["Tổng lớp học", overview.totalClasses],
            ["Tổng lịch học", overview.totalSchedules],
            ["Tổng lịch thi", overview.totalExamSchedules],
            ["Tổng phòng học", overview.totalRooms],
            ["Tổng cơ sở", overview.totalBuildings],
            ["Tổng chương trình", overview.totalPrograms],
          ]
        ),


        ...createSection("II. Cơ cấu giới tính"),
        {
          image: toBase64Image(genderChart),
          width: 220,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(
          ["Giới tính", "Số lượng", "Tỷ lệ"],
          [
            ["Nam", gender.males, ((gender.males / genderTotal) * 100).toFixed(1) + "%"],
            ["Nữ", gender.females, ((gender.females / genderTotal) * 100).toFixed(1) + "%"],
          ]
        ),


        ...createSection("III. Kết quả học tập"),
        {
          image: toBase64Image(passFailChart),
          width: 220,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(
          ["Trạng thái", "Số lượng", "Tỷ lệ"],
          [
            ["Đạt", passfail.passed, ((passfail.passed / passTotal) * 100).toFixed(1) + "%"],
            ["Không đạt", passfail.failed, ((passfail.failed / passTotal) * 100).toFixed(1) + "%"],
          ]
        ),

        ...createSection(revenueTitle),
        {
          image: toBase64Image(revenueChart),
          width: 480,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(tableHeaders, tableRows),


        ...createSection("V. Top sinh viên GPA cao"),
        createTable(
          ["STT", "Mã SV", "Họ tên", "GPA"],
          topStudents.students.map((s, i) => [
            i + 1,
            s.studentCode,
            s.user.fullName,
            s.gpa
          ])
        )
      ],

      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: "center",
          color: "#C2410C"
        },
        meta: {
          fontSize: 10,
          color: "#64748B"
        },
        sectionTitle: {
          fontSize: 15,
          bold: true,
          color: "#EA580C"
        },
        tableHeader: {
          bold: true,
          fillColor: "#FB923C",
          color: "#0F172A",
          alignment: "center"
        }
      }
    }

    const pdfDoc = printer.createPdfKitDocument(doc)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dashboard-report.pdf"
    )

    pdfDoc.pipe(res)
    pdfDoc.end()
  }
}