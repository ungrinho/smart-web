import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Box } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChartComponent() {
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        const uid = localStorage.getItem('uid');
        const totalData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/images/metadata/summary', {
                    params: { uid: uid }
                });
                // console.log('API Response:', response.data);
                const processedData = response.data || [];
                setWeeklyData(processedData);
            } catch (error) {
                // console.error('weeklyData error:', error);
            }
        };

        totalData();
    }, []);

    // console.log('Weekly Data:', weeklyData);

    const groupedData = (weeklyData || []).reduce((acc, { date, ripe, unripe, halfripe }) => {
        if (!acc[date]) {
            acc[date] = { ripe: 0, unripe: 0, halfripe: 0 };
        }
        acc[date].ripe += ripe;
        acc[date].unripe += unripe;
        acc[date].halfripe += halfripe;
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedData).sort();

    const chartData = {
        labels: sortedDates.map(date => dayjs(date).format('M월 D일')),
        datasets: [
            {
                label: 'Ripe',
                data: sortedDates.map(date => groupedData[date].ripe),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
            {
                label: 'Unripe',
                data: sortedDates.map(date => groupedData[date].unripe),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Half-Ripe',
                data: sortedDates.map(date => groupedData[date].halfripe),
                backgroundColor: 'rgba(255, 206, 86, 0.8)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weekly Tomato Ripeness Chart',
            },
        },
        scales: {
            x: {
                stacked: false,
            },
            y: {
                stacked: false,
                beginAtZero: true,
            },
        },
    };

    // console.log('Chart Data:', chartData);

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Bar data={chartData} options={options} />
        </Box>
    );
}

export default BarChartComponent;