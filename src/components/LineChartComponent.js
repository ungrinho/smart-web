import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function LineChartComponent() {
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        const uid = localStorage.getItem('uid');
        const totalData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/images/metadata/summary', {
                    params: { uid: uid }
                });

                // Log the response to check the data structure
                console.log('API Response:', response.data);

                // Ensure the data is an array
                const processedData = response.data || [];
                setWeeklyData(processedData);
            } catch (error) {
                console.error('weeklyData error:', error);
            }
        };

        totalData();
    }, []);

    // Check if weeklyData is correctly set
    console.log('Weekly Data:', weeklyData);

    // 데이터가 없는 경우 빈 객체를 반환
    const groupedData = (weeklyData || []).reduce((acc, { date, ripe, unripe, halfripe }) => {
        if (!acc[date]) {
            acc[date] = { ripe: 0, unripe: 0, halfripe: 0 };
        }
        acc[date].ripe += ripe;
        acc[date].unripe += unripe;
        acc[date].halfripe += halfripe;
        return acc;
    }, {});

    // 날짜를 'n월 n일' 형식으로 변환합니다.
    const chartData = {
        labels: Object.keys(groupedData)
            .sort()
            .map(date => dayjs(date).format('M월 D일')), // 'n월 n일' 형식으로 변환
        datasets: [
            {
                label: 'Ripe',
                data: Object.keys(groupedData).map(date => groupedData[date].ripe),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
            },
            {
                label: 'Unripe',
                data: Object.keys(groupedData).map(date => groupedData[date].unripe),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: false,
            },
            {
                label: 'Half-Ripe',
                data: Object.keys(groupedData).map(date => groupedData[date].halfripe),
                borderColor: 'rgba(255, 206, 86, 1)',
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                fill: false,
            }
        ]
    };

    // Log chartData to verify correctness
    console.log('Chart Data:', chartData);

    return (
        <div>
            <h2>Weekly Tomato Ripeness Chart</h2>
            <Line data={chartData} />
        </div>
    );
}

export default LineChartComponent;
