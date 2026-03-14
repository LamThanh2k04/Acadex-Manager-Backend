import { ChartJSNodeCanvas } from "chartjs-node-canvas"

const width = 800
const height = 600
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height })

export const chartService = {
  // 🟢 Biểu đồ tròn giới tính
  genderPie: async (data) => {
    const config = {
      type: "pie",
      data: {
        labels: ["Nam", "Nữ"],
        datasets: [{
          data: [data.males, data.females]
        }]
      }
    }
    return await chartJSNodeCanvas.renderToBuffer(config)
  },

  // 🟢 Biểu đồ tròn đậu / rớt
  passFailPie: async (data) => {
    const config = {
      type: "pie",
      data: {
        labels: ["Đạt", "Không đạt"],
        datasets: [{
          data: [data.passed, data.failed]
        }]
      }
    }
    return await chartJSNodeCanvas.renderToBuffer(config)
  },

  // 🔵 Biểu đồ đường doanh thu
  revenueLineAuto: async (months) => {

    const years = [...new Set(months.map(m => m.month.slice(0, 4)))]

    let labels = []
    let data = []
    let labelText = ""

    // ===== CASE 1: CHỈ 1 NĂM → HIỂN THỊ 12 THÁNG =====
    if (years.length === 1) {
      const year = years[0]

      // Map tháng hiện có
      const monthMap = {}
      months.forEach(m => monthMap[m.month] = m.total)

      // Tạo đủ 12 tháng
      for (let i = 1; i <= 12; i++) {
        const key = `${year}-${String(i).padStart(2, '0')}`
        labels.push(key)
        data.push(monthMap[key] || 0)
      }

      labelText = `Doanh thu theo tháng năm ${year}`
    }

    // ===== CASE 2: ≥ 2 NĂM → GỘP THEO NĂM =====
    else {
      const yearMap = {}

      months.forEach(m => {
        const y = m.month.slice(0, 4)
        if (!yearMap[y]) yearMap[y] = 0
        yearMap[y] += m.total
      })

      labels = Object.keys(yearMap)
      data = Object.values(yearMap)
      labelText = "Doanh thu theo năm"
    }

    const config = {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: labelText,
          data
        }]
      }
    }

    return await chartJSNodeCanvas.renderToBuffer(config)
  }
}