// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// // Chart.js 컴포넌트 등록
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// // line chart : https://www.chartjs.org/docs/latest/samples/line/line.html#line-chart
// function DataChart() {
//   // 차트 데이터 상태 관리
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

//   useEffect(() => {
//     const uid = localStorage.getItem('uid');
    
//     // API에서 데이터 가져오기
//     axios.get('http://localhost:8080/api/yesterdaySummary', {
//       params: { uid: uid }
//     })
//     .then((response) => {
//       const data = response.data;
      
//       // 차트 데이터 구성
//       const labels = data.map(item => item.timestamp);
//       const temperatures = data.map(item => item.temperature);
//       const humidities = data.map(item => item.humidity);

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: '온도 (°C)',
//             data: temperatures,
//             borderColor: 'rgb(255, 99, 132)',
//             backgroundColor: 'rgba(255, 99, 132, 0.5)',
//           },
//           {
//             label: '습도 (%)',
//             data: humidities,
//             borderColor: 'rgb(53, 162, 235)',
//             backgroundColor: 'rgba(53, 162, 235, 0.5)',
//           },
//         ],
//       });
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//     });
//   }, []);

//   // 차트 옵션 설정
//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: '어제의 온습도 데이터',
//       },
//     },
//   };

//   return (
//     <div>
//       <Line options={options} data={chartData} />
//     </div>
//   );
// }

// export default DataChart;



// 테스트 데이터
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS,
     CategoryScale,
        LinearScale,
     PointElement,
     LineElement,
     Title,
     Tooltip,
     Legend
    } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 테스트 데이터
const testData = [
  { timestamp: '00:00', temperature: 20, humidity: 50 },
  { timestamp: '03:00', temperature: 19, humidity: 52 },
  { timestamp: '06:00', temperature: 18, humidity: 55 },
  { timestamp: '09:00', temperature: 22, humidity: 48 },
  { timestamp: '12:00', temperature: 25, humidity: 45 },
  { timestamp: '15:00', temperature: 26, humidity: 43 },
  { timestamp: '18:00', temperature: 24, humidity: 47 },
  { timestamp: '21:00', temperature: 22, humidity: 49 },
];

function YesterdayData({ useTestData = true }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '온도 (°C)',
        data: [],
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      },
      {
        label: '습도 (%)',
        data: [],
        fill: false,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1
      },
    ],
  });

  useEffect(() => {
    if (useTestData) {
      // 테스트 데이터 사용
      const labels = testData.map(item => item.timestamp);
      const temperatures = testData.map(item => item.temperature);
      const humidities = testData.map(item => item.humidity);

      setChartData({
        labels,
        datasets: [
          {
            label: '온도 (°C)',
            data: temperatures,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: '습도 (%)',
            data: humidities,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      });
    } else {
      // 실제 API 호출
      const uid = localStorage.getItem('uid');
      axios.get('http://localhost:8080/api/yesterdaySummary', {
        params: { uid: uid }
      })
      .then((response) => {
        const data = response.data;
        const labels = data.map(item => item.timestamp);
        const temperatures = data.map(item => item.temperature);
        const humidities = data.map(item => item.humidity);

        setChartData({
          labels,
          datasets: [
            {
              label: '온도 (°C)',
              data: temperatures,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: '습도 (%)',
              data: humidities,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
          ],
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    }
  }, [useTestData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '어제의 온습도',
      },
    },
  };

  return (
    <div>
      <Line options={options} data={chartData} />
    </div>
  );
}

export default YesterdayData;