

// // //npm install chartjs-plugin-annotation --force필요없음
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';

// // Chart.js 컴포넌트 등록
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// function DataChart() {
//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: '온도 (°C)',
//         data: [],
//         borderColor: 'rgb(255, 99, 132)',
//         backgroundColor: 'rgba(255, 99, 132, 0.5)',
//       },
//       {
//         label: '습도 (%)',
//         data: [],
//         borderColor: 'rgb(53, 162, 235)',
//         backgroundColor: 'rgba(53, 162, 235, 0.5)',
//       },
//     ],
//   });

//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const [isTestMode, setIsTestMode] = useState(true);
//   const [averages, setAverages] = useState({ temperature: 0, humidity: 0 });

//   const generateTestData = (date) => {
//     const data = [];
//     const startOfDay = dayjs(date).startOf('day');
    
//     for (let i = 0; i < 24; i++) {
//       const timestamp = startOfDay.add(i, 'hour').format('MM-DD HH시');
//       const temperature = Math.random() * 10 + 20;
//       const humidity = Math.random() * 30 + 40;
      
//       data.push({
//         timestamp,
//         temperature: temperature.toFixed(1),
//         humidity: humidity.toFixed(1)
//       });
//     }
    
//     return data;
//   };

//   useEffect(() => {
//     const uid = localStorage.getItem('uid');
//     const formattedDate = selectedDate.format('YYYY-MM-DD');

//     if (isTestMode) {
//       const testData = generateTestData(selectedDate);
//       updateChartData(testData);
//     } else {
//       axios.get('http://localhost:8080/api/dailySummary', {
//         params: { uid: uid, date: formattedDate }
//       })
//       .then((response) => {
//         updateChartData(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//     }
//   }, [selectedDate, isTestMode]);

//   const updateChartData = (data) => {
//     const labels = data.map(item => item.timestamp);
//     const temperatures = data.map(item => parseFloat(item.temperature));
//     const humidities = data.map(item => parseFloat(item.humidity));

//     // 평균 계산
//     const avgTemperature = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
//     const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

//     setAverages({
//       temperature: avgTemperature.toFixed(1),
//       humidity: avgHumidity.toFixed(1)
//     });

//     setChartData({
//       labels,
//       datasets: [
//         {
//           label: '온도 (°C)',
//           data: temperatures,
//           borderColor: 'rgb(255, 99, 132)',
//           backgroundColor: 'rgba(255, 99, 132, 0.5)',
//         },
//         {
//           label: '습도 (%)',
//           data: humidities,
//           borderColor: 'rgb(53, 162, 235)',
//           backgroundColor: 'rgba(53, 162, 235, 0.5)',
//         },
//         {
//           label: '평균 온도',
//           data: Array(temperatures.length).fill(avgTemperature),
//           borderColor: 'rgba(255, 99, 132, 0.5)',
//           borderDash: [5, 5],
//           borderWidth: 2,
//           pointRadius: 0,
//           fill: false,
//         },
//         {
//           label: '평균 습도',
//           data: Array(humidities.length).fill(avgHumidity),
//           borderColor: 'rgba(53, 162, 235, 0.5)',
//           borderDash: [5, 5],
//           borderWidth: 2,
//           pointRadius: 0,
//           fill: false,
//         },
//       ],
//     });
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: '선택한 날짜의 온습도 데이터',
//       },
//       annotation: {
//         annotations: {
//           temperatureAvgLine: {
//             type: 'line',
//             yMin: averages.temperature,
//             yMax: averages.temperature,
//             borderColor: 'rgb(255, 99, 132)',
//             borderWidth: 2,
//             borderDash: [5, 5],
//             label: {
//               display: true,
//               content: `평균 온도: ${averages.temperature}°C`,
//               position: 'end'
//             }
//           },
//           humidityAvgLine: {
//             type: 'line',
//             yMin: averages.humidity,
//             yMax: averages.humidity,
//             borderColor: 'rgb(53, 162, 235)',
//             borderWidth: 2,
//             borderDash: [5, 5],
//             label: {
//               display: true,
//               content: `평균 습도: ${averages.humidity}%`,
//               position: 'end'
//             }
//           }
//         }
//       }
//     },
//   };
// //       tooltip: {
// //         callbacks: {
// //           afterTitle: function(context) {
// //             if (context[0].datasetIndex === 2) {
// //               return `평균 온도: ${averages.temperature}°C`;
// //             } else if (context[0].datasetIndex === 3) {
// //               return `평균 습도: ${averages.humidity}%`;
// //             }
// //           }
// //         }
// //       }
// //     },
// //   };

//   const handleDateChange = (newDate) => {
//     const sevenDaysAgo = dayjs().subtract(7, 'day');
//     if (newDate.isAfter(sevenDaysAgo)) {
//       setSelectedDate(newDate);
//     } else {
//       alert('최대 7일 전까지의 데이터만 조회할 수 있습니다.');
//     }
//   };

//   const toggleTestMode = () => {
//     setIsTestMode(!isTestMode);
//   };

//   return (
//     <div>
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <DatePicker
//           label="날짜 선택"
//           value={selectedDate}
//           onChange={handleDateChange}
//           maxDate={dayjs()}
//           minDate={dayjs().subtract(7, 'day')}
//         />
//       </LocalizationProvider>
//       <button onClick={toggleTestMode}>
//         {isTestMode ? '실제 데이터 사용' : '테스트 데이터 사용'}
//       </button>
//       <Line options={options} data={chartData} />
//     </div>
//   );
// }

// export default DataChart;