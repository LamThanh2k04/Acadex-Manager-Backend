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
        color: "#CBD5E1"
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
          fillColor: i % 2 === 0 ? "#F8FAFC" : null
        }))
      )
    ]
  },
  layout: {
    hLineWidth: () => 0.6,
    vLineWidth: () => 0.6,
    hLineColor: () => "#E2E8F0",
    vLineColor: () => "#E2E8F0",
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
  async exportDashboard(year, res) {

    const overview = await dashboardService.getOverViewFull()
    const gender = await dashboardService.getTotalGenders()
    const passfail = await dashboardService.getPassFailStatus()
    const revenue = await dashboardService.getLineChartRevenueLineChart(year)
    const topStudents = await dashboardService.getTopStudentGpa()

    const genderChart = await chartService.genderPie(gender)
    const passFailChart = await chartService.passFailPie(passfail)
    const revenueChart = await chartService.revenueLine(revenue.result, year)

    const genderTotal = gender.total || 1
    const passTotal = passfail.total || 1

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

        // ===== OVERVIEW =====
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

        // ===== GENDER =====
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

        ...createSection(`IV. Doanh thu theo tháng năm ${year}`),
        {
          image: toBase64Image(revenueChart),
          width: 480,
          alignment: "center",
          margin: [0, 10, 0, 15]
        },
        createTable(
          ["Tháng", "Doanh thu"],
          revenue.result.map(m => [m.month, formatNumber(m.total)])
        ),

        // ===== TOP GPA =====
        ...createSection("V. Top sinh viên GPA cao"),
        createTable(
          ["Mã SV", "Họ tên", "GPA"],
          topStudents.students.map(s => [
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
          color: "#0F172A"
        },
        meta: {
          fontSize: 10,
          color: "#64748B"
        },
        sectionTitle: {
          fontSize: 15,
          bold: true,
          color: "#1D4ED8"
        },
        tableHeader: {
          bold: true,
          fillColor: "#E2E8F0",
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