import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function YesterdayChart() {
  const [chartData, setChartData] = useState({
    labels: ['최고', '최저', '평균'],
    datasets: [
      {
        label: '온도 (°C)',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // 온도의 색상
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
        stack: 'temperature',
      },
      {
        label: '습도 (%)',
        data: [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)', // 습도의 색상
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
        stack: 'humidity',
      },
    ],
  });

  const [dailySummary, setDailySummary] = useState({
    avg_temperature: null, avg_humidity: null,
    max_temperature: null, max_humidity: null,
    min_temperature: null, min_humidity: null 
  });

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    
    axios.get('http://localhost:8080/api/yesterdaySummary', {
      params: { uid: uid }
    })
    .then((response) => {
      const data = response.data[0];
      console.log(data)
      setDailySummary({
        avg_temperature: data.avgTemperature.toFixed(1),
        avg_humidity: data.avgHumidity.toFixed(1),
        max_temperature: data.maxTemperature.toFixed(1),
        max_humidity: data.maxHumidity.toFixed(1),
        min_temperature: data.minTemperature.toFixed(1),
        min_humidity: data.minHumidity.toFixed(1)
      });

      updateChartData({
        avg_temperature: data.avgTemperature,
        avg_humidity: data.avgHumidity,
        max_temperature: data.maxTemperature,
        max_humidity: data.maxHumidity,
        min_temperature: data.minTemperature,
        min_humidity: data.minHumidity
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
  }, []);

  const updateChartData = (summary) => {
    setChartData({
      labels: ['최고', '최저', '평균'],
      datasets: [
        {
          label: '온도 (°C)',
          data: [summary.max_temperature, summary.min_temperature, summary.avg_temperature],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          stack: 'temperature',
        },
        {
          label: '습도 (%)',
          data: [summary.max_humidity, summary.min_humidity, summary.avg_humidity],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
          stack: 'humidity',
        },
      ],
    });
  };

  const chartRef = useRef(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '전날의 온습도 데이터',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Bar options={options} data={chartData} ref={chartRef} />
    </Box>
  );
}

export default YesterdayChart;
