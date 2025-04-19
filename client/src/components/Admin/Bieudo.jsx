import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import axios from "axios";

const Bieudo = () => {
  const chartRef2 = useRef(null);
  const chartInstance2 = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard/revenue/weekdays`);
        const revenues = res.data.revenuePerDay;

        const ctx = chartRef2.current.getContext("2d");
        if (chartInstance2.current) chartInstance2.current.destroy();

        chartInstance2.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Thứ Hai", "Thứ ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"],
            datasets: [
              {
                label: "Doanh thu trong tuần",
                data: revenues,
                backgroundColor: [
                  "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)",
                  "rgba(100, 255, 218, 1)"
                ],
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + " VND";
                  }
                }
              }
            }
          }
        });
      } catch (error) {
        console.error("Lỗi lấy dữ liệu doanh thu tuần:", error);
      }
    };

    fetchData();

    return () => {
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, []);

  return (
    <div className="graphBox">
  {/* <div className="box">
    <canvas ref={chartRef1}></canvas>
  </div> */}
  <div className="box">
    <canvas ref={chartRef2}></canvas>
  </div>
</div>

  );
};

export default Bieudo;
