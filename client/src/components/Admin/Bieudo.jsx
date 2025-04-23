import "chart.js/auto";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

const Bieudo = () => {
  const [chartType, setChartType] = useState("month"); // Đặt mặc định là "month" hoặc "year"
  const [dataChart, setDataChart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(1);


  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);

        switch (chartType) {
          case "day": {
            const { data: dayData } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/daily/${selectedMonth}`);
            setDataChart(dayData.revenuePerDay || []);
            break;
          }

          case "month": {
            const { data: monthData } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/monthly`);
            setDataChart(monthData.revenuePerMonth || []);
            break;
          }
          case "year": {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/yearly`);
            const yearData = await response.json();
            // Chuyển đổi mảng đối tượng thành mảng số doanh thu
            const years = Array.isArray(yearData.revenuePerYear) ? yearData.revenuePerYear.map(y => y.revenue) : [];
            setDataChart(years);
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
  }, [chartType]);
  
  useEffect(() => {
    if (chartType === "day") {
      const fetchRevenue = async () => {
        try {
          setLoading(true);
          const { data: dayData } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/daily/${selectedMonth}`);
          setDataChart(dayData.revenuePerDay || []);
          setLoading(false);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu biểu đồ theo ngày:", error);
          setLoading(false);
        }
      };
      fetchRevenue();
    }
  }, [chartType, selectedMonth]);
  
  const labels = {
    month: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"],
    year: Array(dataChart.length).fill(0).map((_, i) => `Năm ${new Date().getFullYear() - dataChart.length + 1 + i}`),
    day: Array(dataChart.length).fill(0).map((_, i) => `Ngày ${i + 1}`),

  };

  return (
    <div className="graphBox">
      <div className="box">
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: 10 }}>
            <select
              onChange={(e) => setChartType(e.target.value)}
              value={chartType}
              style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            >
              <option value="month">Theo Tháng</option>
              <option value="year">Theo Năm</option>
              <option value="day">Theo Ngày</option>
            </select>
            {chartType === "day" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ccc", marginLeft: "10px" }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                  ))}
                </select>
              )}
          </div>

          {/* Hiển thị loading hoặc biểu đồ */}
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <Bar
              data={{
                labels: labels[chartType],// Nhãn trục X
                datasets: [{
                  label: "Doanh thu (VND)",
                  data: dataChart,// Dữ liệu trục Y
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
