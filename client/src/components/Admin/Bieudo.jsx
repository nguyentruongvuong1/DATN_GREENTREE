import "chart.js/auto";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

const Bieudo = () => {
  const now = new Date();
  const [chartType, setChartType] = useState("day"); // mặc định là theo ngày
  const [dataChart, setDataChart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [yearLabels, setYearLabels] = useState([]);


  // Gọi API lấy danh sách năm có dữ liệu
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/years`);
        setAvailableYears(data.years || []);
        if (!data.years.includes(selectedYear)) {
          setSelectedYear(data.years[0] || now.getFullYear());
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách năm:", error);
      }
    };
    fetchYears();
  }, []);

  // Gọi API theo chartType
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);

        switch (chartType) {
          case "day": {
            const { data } = await axios.get(
              `${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/daily/${selectedMonth}?year=${selectedYear}`
            );
            setDataChart(data.revenuePerDay || []);
            break;
          }
          case "month": {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/monthly`);
            setDataChart(data.revenuePerMonth || []);
            break;
          }
          case "year": {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/yearly`);
            const yearData = await response.json();
          
            if (Array.isArray(yearData.revenuePerYear)) {
              const revenues = yearData.revenuePerYear.map(y => y.revenue);
              const years = yearData.revenuePerYear.map(y => `Năm ${y.year}`);
              setDataChart(revenues);
              setYearLabels(years); // <-- Thêm state mới để giữ label năm chính xác
            } else {
              setDataChart([]);
              setYearLabels([]);
            }
            break;
          }
          
          default:
            break;
        }

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu biểu đồ:", error);
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [chartType, selectedMonth, selectedYear]);

  const labels = {
    month: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
    year: yearLabels,    day: Array(dataChart.length).fill(0).map((_, i) => `Ngày ${i + 1}`),
  };

  return (
    <div className="graphBox">
      <div className="box">
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: 10, display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              onChange={(e) => setChartType(e.target.value)}
              value={chartType}
              style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="day">Theo Ngày</option>
              <option value="month">Theo Tháng</option>
              <option value="year">Theo Năm</option>
            </select>

            {chartType === "day" && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <Bar
              data={{
                labels: labels[chartType],
                datasets: [{
                  label: "Doanh thu (VND)",
                  data: dataChart,
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                  borderRadius: 5,
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return value.toLocaleString("vi-VN");
                      }
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Bieudo;
