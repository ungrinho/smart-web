import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent, CardMedia, Typography, CardActionArea, Grid, Box, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../contexts/AuthContext';
import { topicButtonContext } from '../../App'
import ChartModal from '../../components/ChartModal';
import ROSLIB from "roslib"
import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery50Icon from '@mui/icons-material/Battery50';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MainContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Content = styled('div')({
  width: '100%',
  maxWidth: 1200,
  padding: '55px 20px 0px',
});

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px',
});

const StyledCard = styled(Card)(({ theme, hoverable }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: hoverable ? 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out' : 'none',
  '&:hover': hoverable ? {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  } : {},
}));

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
}));

const CardInfo = styled(Typography)({
  marginBottom: '8px',
});

const CardContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const ToggleButton = styled('button')(({ isrunning }) => ({ 
  minWidth: '50%',
  height: '100%',
  fontSize: '15px',
  backgroundColor: isrunning === 'true' ? 'red' : 'green',
  color: 'white',
  '&:hover': {
    backgroundColor: isrunning === 'true' ? '#d32f2f' : '#388e3c',
  },
}));

const hoverStyle = {
  backgroundColor: '#f0f0f0',
};

const Main = React.memo(() => {
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [robotStatus, setRobotStatus] = useState('');
  const [robotBattery, setRobotBattery] = useState('');
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null });
  const [sentSensorData, setSentSensorData] = useState({ temperature: null, humidity: null });
  const [haveToUpdate, setUpdateFlag] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const my_context = useContext(AuthContext);
  const topic_context = useContext(topicButtonContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [yesterdayData, setYesterdayData] = useState({ avg_temperature: null, avg_humidity: null });
  const [ros, setRos] = useState(null);
  const [startPublisher, setStartPublisher] = useState(null);
  const [yesterdayHourlyData, setYesterdayHourlyData] = useState([]);

  console.log("my_context", my_context.user)
  console.log("topic_context", topic_context)
  console.log("topic_context", topic_context.topicButton)

  // 로그인 관련
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("uid", user.uid)
      } else {
        localStorage.setItem("uid", null)
      }
    });
  }, [])
  
  useEffect(() => {
    sentSensorData.temperature != sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false) 
    sentSensorData.humidity != sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false) 
  }, [sentSensorData])

  // ROS 토픽 연결
  useEffect(() => {
    const newRos = new ROSLIB.Ros({
      url: 'ws://192.168.0.13:9090'
    });

    newRos.on("connection", () => {
      console.log('웹소켓 서버에 연결되었습니다.');
      setupROSTopics(newRos);
    });

    newRos.on("error", (error) => {
      console.log('웹소켓 서버 연결 오류: ', error);
    });

    newRos.on("close", () => {
      console.log('웹소켓 서버 연결이 닫혔습니다.');
    });

    setRos(newRos);

    return () => {
      newRos.close();
    };
  }, []);

  const setupROSTopics = (ros) => {
    let lastBattery = null;
    let lastStatus = null;

    const statesListener = new ROSLIB.Topic({
      ros: ros,
      name: '/jetbot_mini/states',
      messageType: 'std_msgs/String'
    });

    const newStartPublisher = new ROSLIB.Topic({
      ros: ros,
      name: '/jetbot_mini/auto',
      messageType: 'std_msgs/String'
    });

    setStartPublisher(newStartPublisher);

    statesListener.subscribe((message) => {
      console.log("이것이 메시지 :", message.data)

      const topics = message.data.split(",")
      if (topics[0] !== lastBattery) {

      }
      switch(topics[0]){
        case 'Battery_High' :
          setRobotBattery(<BatteryFullIcon/>)
          break;
        
        case 'Battery_Medium' :
          setRobotBattery(<Battery50Icon/>)
          break;

        case 'Battery_Low' :
          setRobotBattery(<Battery0BarIcon/>)
          break;
        default:
          setRobotBattery('');
      }
      lastBattery = topics[0];

      setRobotStatus(topics[1])
    });
  }

  const toggleRobot = () => {
    if (startPublisher) {
      const message = new ROSLIB.Message({
        data: topic_context.topicButton ? 'start' : 'stop'
      });

      console.log(message);
      console.log(`${topic_context.topicButton ? 'Start' : 'Stop'} message published`);

      topic_context.setTopicButton(!topic_context.topicButton)
      startPublisher.publish(message);
    } else {
      console.log('Start publisher not ready');
    }
  };

  // arduino 실시간 온습도 수신
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
    sentSensorData.temperature != sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false) 
    sentSensorData.humidity != sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false) 
  }, [sentSensorData])
  
  // 확인 후 DB
  useEffect(() =>{
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

  // 어제의 온습도 
  useEffect(() => {
    const { avg_temperature, avg_humidity } = yesterdayData
    const uid = localStorage.getItem('uid');
    axios.get('http://localhost:8080/api/yesterdaySummary', {
      params:{
        uid: uid
      }
    })
    .then((retval) => {
      setYesterdayData({
        avg_temperature: retval.data[0].avgTemperature.toFixed(1),
        avg_humidity: retval.data[0].avgHumidity.toFixed(1)
      })
    }).catch((retval) => {
      console.log("Error@@", retval)
    })
  }, []);

  useEffect(() => {
    // 어제 날짜의 시간별 데이터를 가져오는 함수
    const fetchYesterdayHourlyData = async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = yesterday.toISOString().split('T')[0];

      try {
        const response = await axios.get(`http://localhost:8080/api/hourlyData`, {
          params: {
            date: formattedDate,
            uid: localStorage.getItem('uid')
          }
        });
        setYesterdayHourlyData(response.data);
      } catch (error) {
        console.error("Error fetching yesterday's hourly data:", error);
      }
    };

    fetchYesterdayHourlyData();
  }, []);

  if (!yesterdayData) {
    return <div>Loading...</div>;
  }

  return (
    <MainContainer>
      <Content>
        <Header>
          {my_context.user ? my_context.user.email : "아무개"}의 농장
        </Header>
        <CardContainer>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <StyledCardContent>
                    <CardTitle variant="h5">현재 온습도</CardTitle>
                    <Box display="flex" justifyContent="space-around" alignItems="center">
                      <Box textAlign="center">
                      <Typography variant="h4" color="#e91e63">{sensorData.temperature}°C</Typography>
                        <Typography variant="subtitle1">온도</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="h4" color="#3d5afe">{sensorData.humidity}%</Typography>
                        <Typography variant="subtitle1">습도</Typography>
                      </Box> 
                    </Box>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={12} md={8}>
                <StyledCard hoverable onClick={handleOpenModal}>
                  <StyledCardContent>
                    <CardTitle variant="h5">전날 평균 온습도</CardTitle>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={yesterdayHourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="온도" />
                        <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3d5afe" name="습도" />
                      </LineChart>
                    </ResponsiveContainer>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <StyledCardContent>
                    <CardTitle variant="h5">Robot Condition</CardTitle>
                    <div>
                      <CardInfo variant="body2" color="text.secondary">
                        상태: {robotStatus}
                      </CardInfo>
                      <br />
                      <CardInfo variant="body2" color="text.secondary">
                        배터리: {robotBattery}
                      </CardInfo>
                    </div>
                    <ToggleButton 
                      onClick={toggleRobot} 
                      isrunning={(!topic_context.topicButton).toString()}
                      style={{marginTop: '16px'}}
                    >
                      {!topic_context.topicButton ? 'Stop' : 'Start'}
                    </ToggleButton>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
              {/* 관리 페이지 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard hoverable> 
                  <CardActionArea component={Link} to="/manage" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        관리 페이지
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        이동하기
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
              {/* 객체 확인 페이지 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard hoverable> 
                  <CardActionArea component={Link} to="/obj" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        객체 확인 페이지
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        이동하기
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
              {/* CS 페이지 카드
              {/* // 주석: md 값을 8로 변경하여 두 열을 차지하도록 합니다. */}
              {/* <Grid item xs={12} md={8}> 
                <StyledCard hoverable sx={{ height: '10px' }}>
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
                </StyledCard>
              </Grid>  */}
            </Grid>
          </Box>
        </CardContainer>
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
