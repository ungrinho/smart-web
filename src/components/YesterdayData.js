// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Typography } from '@mui/material';

// function YesterdayData() {
//   const [yesterdayData, setYesterdayData] = useState({ avg_temperature: null, avg_humidity: null });

//   useEffect(() => {
//     const { avg_temperature, avg_humidity } = yesterdayData
//     const uid = localStorage.getItem('uid');
//     axios.get('http://localhost:8080/api/yesterdaySummary', {
//       params:{
//         uid: uid
//       }
//     })
//     .then((retval) => {
//       console.log("success!", retval.data[0].avgHumidity)
//       setYesterdayData({
//         avg_temperature: retval.data[0].avgTemperature.toFixed(2),
//         avg_humidity: retval.data[0].avgHumidity.toFixed(2)
//       })
//       console.log(avg_temperature)
//     }).catch((retval) => {
//       console.log("Error@@", retval)
//     })
//   }, []);

//   if (!yesterdayData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Typography variant="body2" color="text.secondary">
//       온도: {yesterdayData.avg_temperature}°C
//     </Typography>
//     <br></br>
//     <Typography variant="body2" color="text.secondary">
//       습도: {yesterdayData.avg_humidity}%
//     </Typography>
//   );
// }

// export default YesterdayData;