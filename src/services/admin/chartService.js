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
  revenueLine: async (months, year) => {
    const config = {
      type: "line",
      data: {
        labels: months.map(m => m.month),
        datasets: [{
          label: `Doanh thu ${year}`,
          data: months.map(m => m.total)
        }]
      }
    }
    return await chartJSNodeCanvas.renderToBuffer(config)
  }
}