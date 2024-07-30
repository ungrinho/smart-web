// import React, { useState, useEffect, useRef, useContext } from 'react';
// import axios from 'axios';
// import { auth } from '../../config/firebase';
// import { Link, useNavigate } from 'react-router-dom';
// import { onAuthStateChanged } from 'firebase/auth';
// import YesterdayData from '../../components/YesterdayData';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';
// import Typography from '@mui/material/Typography';
// import { CardActionArea } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import Grid from '@mui/material/Unstable_Grid2';
// import Box from '@mui/material/Box';
// import { AuthContext } from '../../contexts/AuthContext';
// import ChartModal from '../../components/ChartModal';


// const MainContainer = styled('div')({
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
// });

// const Content = styled('div')({
//   width: '100%',
//   maxWidth: 1200,
//   padding: '20px',
// });

// const Header = styled('div')({
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   width: '100%',
//   marginBottom: '20px',
// });

// // const CardContainer = styled('div')({
// //   display: 'grid',
// //   gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
// //   gap: '20px',
// // });


// const CardContainer = styled('div')(({ theme }) => ({
//   display: 'grid',
//   gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//   gap: '20px',
//   [theme.breakpoints.down('sm')]: {
//     gridTemplateColumns: '1fr',
//   },
// }));

// const Main = React.memo(() => {
//   const navigate = useNavigate();
//   const [farmName, setFarmName] = useState('');
//   const [robotStatus, setRobotStatus] = useState('');
//   const [robotBattery, setRobotBattery] = useState(0);
//   const [sensorData, setSensorData] = useState({ temperature: null, humidity: null });
//   const [sentSensorData, setSentSensorData] = useState({ temperature: null, humidity: null });
//   const [haveToUpdate, setUpdateFlag] = useState(true);
//   const [error, setError] = useState(null);
//   const wsRef = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const my_context = useContext(AuthContext);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);

//   console.log("my_context", my_context.user)

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         console.log("현재 로그인 중인 유저의 uid :", user.uid)
//         localStorage.setItem("uid", user.uid)
//       } else {
//         console.log("로그인 유저가 없습니다!")
//         localStorage.setItem("uid", null)
//       }
//     });
//   }, [])

//   useEffect(() => {
//     const ws = new WebSocket('ws://localhost:8765');
//     wsRef.current = ws;

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setError(null);
//       reconnectAttempts.current = 0; 
//     };

//     ws.onclose = () => {
//       console.log('WebSocket Disconnected');
//     };

//     ws.onmessage = (event) => {
//       const data = event.data;
//       console.log('Received data from websocket:', data);
//       const tempMatch = data.match(/Temperature:\s*([\d.]+)/);
//       const humidityMatch = data.match(/Humidity:\s*([\d.]+)/);

//       if (tempMatch && humidityMatch) {
//         const temperature = parseFloat(tempMatch[1]);
//         const humidity = parseFloat(humidityMatch[1]);

//         if (!isNaN(temperature) && !isNaN(humidity)) {
//           setSentSensorData({ 
//             temperature: temperature.toFixed(1), 
//             humidity: humidity.toFixed(1) 
//           });
//         } else {
//           console.error('Invalid number in data:', data);
//         }
//       } else {
//         console.error('Invalid data format received:', data);
//       }
//     };
//   }, []);

//   // 현재의 온습도와 전송받은 온습도가 다른지를 확인
//   useEffect(() => {
//     console.log("NEW :", sentSensorData)
//     console.log("OLD :", sensorData)

//     sentSensorData.temperature != sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false) 
//     sentSensorData.humidity != sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false) 
//   }, [sentSensorData])

//   // 확인 후 DB
//   useEffect(() =>{

//     // console.log("usememo called")
//     const { temperature, humidity } = sensorData
//     // if (temperature != sensorData.temperature || humidity != sensorData.humidity){
//     // axios.post('http://localhost:8080/api/saveData', {
//     //   temperature: sensorData.temperature,
//     //   humidity: sensorData.humidity
//     // })

//     //setSensorData

//     if(haveToUpdate){
//       setSensorData({
//         ...sentSensorData
//       })
//     }
//   }, [haveToUpdate])

//   // 온습도 업데이트 될 때 마다 저장
//   useEffect(() => {
//     console.log("업데이트 값 :", sensorData)
//     axios.post('http://localhost:8080/api/saveData', {
//       ...sensorData
//     }).then((retVal) => {
//       console.log("Well Saved!", retVal)
//     }).catch((retVal) => {
//       console.log("Error!", retVal)
//     })
    
//     //setSensorData
//     setUpdateFlag(false)
//   }, [sensorData])

//   // 모달을 여는 함수
//   const handleOpenModal = () => {
//     setIsModalOpen(true);
//   };

//   // 모달을 닫는 함수
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSnackbarOpen(true);
//   };

//   const handleCloseSnackbar = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setSnackbarOpen(false);
//   };

//   return (
//     <MainContainer>
//       <Content>
//         <Header>
//           {my_context.user.email}의 농장
//         </Header>
//         <CardContainer>
//           <Box sx={{ flexGrow: 1 }}>
//             <Grid container spacing={2}>
//               <Grid item xs>
//                 <Card>
//                   <CardActionArea>
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         현재 온습도
//                       </Typography>
//                       <br></br>
//                       <Typography variant="body2" color="text.secondary">
//                         온도: {sensorData.temperature}°C
//                       </Typography>
//                       <br></br>
//                       <Typography variant="body2" color="text.secondary">
//                         습도: {sensorData.humidity}%
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//               <Grid item xs>
//                 <Card>
//                   <CardActionArea onClick={handleOpenModal}>
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         전날 평균 온습도
//                       </Typography>
//                       <YesterdayData />
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//               {/* <Gsrid item xs={8} md={4}> */}
//               <Grid item xs={12} sm={6} md={4}>
//                 <Card>
//                   <CardActionArea>
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         Robot Condition
//                       </Typography>
//                       <br></br>
//                       <Typography variant="body2" color="text.secondary">
//                         상태: {robotStatus}
//                       </Typography>
//                       <br></br>
//                       <Typography variant="body2" color="text.secondary">
//                         배터리: {robotBattery}
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//               <Grid item xs={8} md={15}>
//                 <Card>
//                   <CardActionArea component={Link} to="/manage">
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         관리 페이지
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         이동하기
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//               <Grid item xs={8} md={15}>
//                 <Card>
//                   <CardActionArea component={Link} to="/obj">
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         객체 확인 페이지
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         이동하기
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//               <Grid item xs={8} md={15}>
//                 <Card>
//                   <CardActionArea component={Link} to="/cs">
//                     <CardContent>
//                       <Typography gutterBottom variant="h5" component="div">
//                         CS 페이지
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         이동하기
//                       </Typography>
//                     </CardContent>
//                   </CardActionArea>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         </CardContainer>
//       </Content>
//       <ChartModal 
//         open={isModalOpen} 
//         onClose={handleCloseModal}
//         title="전날 온습도 상세 정보"
//       >
//       </ChartModal>
//     </MainContainer>
//   );
// });

// export default Main;











import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import YesterdayData from '../../components/YesterdayData';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { AuthContext } from '../../contexts/AuthContext';
import ChartModal from '../../components/ChartModal';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// 반응형 스타일 컴포넌트 정의
const MainContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // 작은 화면에서의 스타일 조정
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

const Content = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  padding: '20px',
  // 작은 화면에서 패딩 줄이기
  [theme.breakpoints.down('sm')]: {
    padding: '10px',
  },
}));

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px',
  // 작은 화면에서 폰트 크기 줄이기
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

// 카드 타이틀을 위한 스타일 컴포넌트
const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  // 작은 화면에서 폰트 크기 줄이기
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

// 카드 내용을 위한 스타일 컴포넌트
const CardText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  // 작은 화면에서 폰트 크기 줄이기
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const Main = React.memo(() => {
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [robotStatus, setRobotStatus] = useState('');
  const [robotBattery, setRobotBattery] = useState(0);
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null });
  const [sentSensorData, setSentSensorData] = useState({ temperature: null, humidity: null });
  const [haveToUpdate, setUpdateFlag] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const my_context = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // useMediaQuery 훅을 사용하여 현재 화면 크기 확인
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // 사용자 인증 상태 변경 감지
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("현재 로그인 중인 유저의 uid :", user.uid);
        localStorage.setItem("uid", user.uid);
      } else {
        console.log("로그인 유저가 없습니다!");
        localStorage.setItem("uid", null);
      }
    });
  }, []);

  // WebSocket 연결 및 데이터 수신 처리
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setError(null);
      reconnectAttempts.current = 0; 
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    ws.onmessage = (event) => {
      const data = event.data;
      console.log('Received data from websocket:', data);
      const tempMatch = data.match(/Temperature:\s*([\d.]+)/);
      const humidityMatch = data.match(/Humidity:\s*([\d.]+)/);

      if (tempMatch && humidityMatch) {
        const temperature = parseFloat(tempMatch[1]);
        const humidity = parseFloat(humidityMatch[1]);

        if (!isNaN(temperature) && !isNaN(humidity)) {
          setSentSensorData({ 
            temperature: temperature.toFixed(1), 
            humidity: humidity.toFixed(1) 
          });
        } else {
          console.error('Invalid number in data:', data);
        }
      } else {
        console.error('Invalid data format received:', data);
      }
    };
  }, []);

  // 센서 데이터 업데이트 필요 여부 확인
  useEffect(() => {
    console.log("NEW :", sentSensorData);
    console.log("OLD :", sensorData);

    sentSensorData.temperature !== sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false); 
    sentSensorData.humidity !== sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false); 
  }, [sentSensorData]);

  // 센서 데이터 업데이트
  useEffect(() => {
    if (haveToUpdate) {
      setSensorData({
        ...sentSensorData
      });
    }
  }, [haveToUpdate, sentSensorData]);

  // 업데이트된 센서 데이터 서버에 저장
  useEffect(() => {
    console.log("업데이트 값 :", sensorData);
    axios.post('http://localhost:8080/api/saveData', {
      ...sensorData
    }).then((retVal) => {
      console.log("Well Saved!", retVal);
    }).catch((retVal) => {
      console.log("Error!", retVal);
    });
    
    setUpdateFlag(false);
  }, [sensorData]);

  // 모달 열기 함수
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSnackbarOpen(true);
  };

  // 스낵바 닫기 함수
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <MainContainer>
      <Content>
        <Header>
          {my_context.user.email}의 농장
        </Header>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={isSmallScreen ? 1 : 2}>
            {/* 현재 온습도 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      현재 온습도
                    </CardTitle>
                    <CardText variant="body2" color="text.secondary">
                      온도: {sensorData.temperature}°C
                    </CardText>
                    <CardText variant="body2" color="text.secondary">
                      습도: {sensorData.humidity}%
                    </CardText>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            {/* 전날 평균 온습도 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={handleOpenModal}>
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      전날 평균 온습도
                    </CardTitle>
                    <YesterdayData />
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            {/* 로봇 상태 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      Robot Condition
                    </CardTitle>
                    <CardText variant="body2" color="text.secondary">
                      상태: {robotStatus}
                    </CardText>
                    <CardText variant="body2" color="text.secondary">
                      배터리: {robotBattery}
                    </CardText>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            {/* 관리 페이지 링크 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea component={Link} to="/manage">
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      관리 페이지
                    </CardTitle>
                    <CardText variant="body2" color="text.secondary">
                      이동하기
                    </CardText>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            {/* 객체 확인 페이지 링크 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea component={Link} to="/obj">
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      객체 확인 페이지
                    </CardTitle>
                    <CardText variant="body2" color="text.secondary">
                      이동하기
                    </CardText>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            {/* CS 페이지 링크 카드 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea component={Link} to="/cs">
                  <CardContent>
                    <CardTitle gutterBottom variant="h5" component="div">
                      CS 페이지
                    </CardTitle>
                    <CardText variant="body2" color="text.secondary">
                      이동하기
                    </CardText>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Content>
      
      {/* 차트 모달 */}
      <ChartModal 
        open={isModalOpen} 
        onClose={handleCloseModal}
        title="전날 온습도 상세 정보"
      />
      
      {/* 스낵바 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Chart closed"
      />
    </MainContainer>
  );
});

export default Main;
