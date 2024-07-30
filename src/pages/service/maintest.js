import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import YesterdayData from '../../components/YesterdayData';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { AuthContext } from '../../contexts/AuthContext';
import ChartModal from '../../components/ChartModal';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// 반응형 스타일 적용
const MainContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // 미디어 쿼리를 사용하여 작은 화면에서의 스타일 조정
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

// CardContainer 스타일 제거 (Grid 컴포넌트로 대체)

const Main = React.memo(() => {

  // useMediaQuery 훅을 사용하여 현재 화면 크기 확인
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

  console.log("my_context", my_context.user)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("현재 로그인 중인 유저의 uid :", user.uid)
        localStorage.setItem("uid", user.uid)
      } else {
        console.log("로그인 유저가 없습니다!")
        localStorage.setItem("uid", null)
      }
    });
  }, [])

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

  // 현재의 온습도와 전송받은 온습도가 다른지를 확인
  useEffect(() => {
    console.log("NEW :", sentSensorData)
    console.log("OLD :", sensorData)

    sentSensorData.temperature != sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false) 
    sentSensorData.humidity != sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false) 
  }, [sentSensorData])

  // 확인 후 DB
  useEffect(() =>{

    // console.log("usememo called")
    const { temperature, humidity } = sensorData
    // if (temperature != sensorData.temperature || humidity != sensorData.humidity){
    // axios.post('http://localhost:8080/api/saveData', {
    //   temperature: sensorData.temperature,
    //   humidity: sensorData.humidity
    // })

    //setSensorData

    if(haveToUpdate){
      setSensorData({
        ...sentSensorData
      })
    }
  }, [haveToUpdate])

  // 온습도 업데이트 될 때 마다 저장
  useEffect(() => {
    console.log("업데이트 값 :", sensorData)
    axios.post('http://localhost:8080/api/saveData', {
      ...sensorData
    }).then((retVal) => {
      console.log("Well Saved!", retVal)
    }).catch((retVal) => {
      console.log("Error!", retVal)
    })
    
    //setSensorData
    setUpdateFlag(false)
  }, [sensorData])

  // 모달을 여는 함수
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫는 함수
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSnackbarOpen(true);
  };

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
          {/* Grid 컴포넌트의 spacing 속성을 반응형으로 조정 */}
          <Grid container spacing={isSmallScreen ? 1 : 2}>
            {/* 각 Grid 아이템의 xs 속성을 조정하여 작은 화면에서 전체 너비를 차지하도록 함 */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                현재 온습도
                            </Typography>
                            <br></br>
                            <Typography variant="body2" color="text.secondary">
                                온도: {sensorData.temperature}°C
                            </Typography>
                            <br></br>
                            <Typography variant="body2" color="text.secondary">
                                습도: {sensorData.humidity}%
                            </Typography>
                        </CardContent>
                    </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardActionArea onClick={handleOpenModal}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            전날 평균 온습도
                        </Typography>
                        <YesterdayData />
                    </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
            <Card>
                <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        Robot Condition
                      </Typography>
                      <br></br>
                      <Typography variant="body2" color="text.secondary">
                        상태: {robotStatus}
                      </Typography>
                      <br></br>
                      <Typography variant="body2" color="text.secondary">
                        배터리: {robotBattery}
                      </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea component={Link} to="/manage">
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        관리 페이지
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        이동하기
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea component={Link} to="/obj">
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        객체 확인 페이지
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        이동하기
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardActionArea component={Link} to="/cs">
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        CS 페이지
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        이동하기
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
            </Grid>
          </Grid>
        </Box>
      </Content>
      <ChartModal 
        open={isModalOpen} 
        onClose={handleCloseModal}
        title="전날 온습도 상세 정보"
      >
      </ChartModal>
    </MainContainer>
  );
});

export default Main;