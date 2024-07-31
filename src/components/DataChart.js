import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DataChart() {
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

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [dailySummary, setDailySummary] = useState({
    avg_temperature: null, avg_humidity: null,
    max_temperature: null, max_humidity: null,
    min_temperature: null, min_humidity: null 
  });

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    const formattedDate = selectedDate.format('YYYY-MM-DD');

    axios.get('http://localhost:8080/api/dailySummary', {
      params: { date: formattedDate, uid: uid }
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
  }, [selectedDate]);

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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '선택한 날짜의 온습도 데이터',
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

  const handleDateChange = (newDate) => {
    const sevenDaysAgo = dayjs().subtract(90, 'day');
    if (newDate.isAfter(sevenDaysAgo)) {
      setSelectedDate(newDate);
    } else {
      alert('최대 90일 전까지의 데이터만 조회할 수 있습니다.');
    }
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="날짜 선택"
          value={selectedDate}
          onChange={handleDateChange}
          maxDate={dayjs()}
          minDate={dayjs().subtract(90, 'day')}
        />
      </LocalizationProvider>
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default DataChart;
