import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
// import YesterdayData from '../../components/YesterdayData';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import { AuthContext } from '../../contexts/AuthContext';
import ChartModal from '../../components/ChartModal';
import ROSLIB from "roslib"
import Battery0BarIcon from '@mui/icons-material/Battery0Bar';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import Battery50Icon from '@mui/icons-material/Battery50';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Button } from '@mui/material'

const MainContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Content = styled('div')({
  width: '100%',
  maxWidth: 1200,
  padding: '100px 20px 20px',
});

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px',
});

const StyledCard = styled(Card)({
  height: '100%',
  // display: 'flex',
  // flexDirection: 'column',
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

const CardTitle = styled(Typography)({
  marginBottom: '16px',
});

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

const ToggleButton = styled(Button)(({ isrunning }) => ({ 
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
  backgroundColor: '#f0f0f0', // 원하는 hover 색상으로 변경
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [yesterdayData, setYesterdayData] = useState({ avg_temperature: null, avg_humidity: null });
  const [ros, setRos] = useState(null);
  const [startPublisher, setStartPublisher] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  console.log("my_context", my_context.user)

  // 로그인 관련
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log("현재 로그인 중인 유저의 uid :", user.uid)
        localStorage.setItem("uid", user.uid)
      } else {
        // console.log("로그인 유저가 없습니다!") 
        localStorage.setItem("uid", null)
      }
    });
  }, [])
  
  useEffect(() => {
    // console.log("NEW :", sentSensorData)
    // console.log("OLD :", sensorData)

    sentSensorData.temperature != sensorData.temperature ? setUpdateFlag(true) : setUpdateFlag(false) 
    sentSensorData.humidity != sensorData.humidity ? setUpdateFlag(true) : setUpdateFlag(false) 
  }, [sentSensorData])

  // ROS 토픽 연결
  useEffect(() => {
    const newRos = new ROSLIB.Ros({
      url: 'ws://192.168.0.13:9090'
    });

    newRos.on("connection", () => {
      console.log("Connected to websocket server.");
      setupROSTopics(newRos);
    });

    newRos.on("error", (error) => {
      console.log("Error connecting to websocket server:", error);
    });

    newRos.on("close", () => {
      console.log("Connection to websocket server closed.");
    });

    setRos(newRos);

    return () => {
      newRos.close();
    };
  }, []);

  const setupROSTopics = (ros) => {
    let lastBattery = null;
    let lastStatus = null;

    const batteryListener = new ROSLIB.Topic({
      ros: ros,
      name: '/jetbot_mini/battery',
      messageType: 'std_msgs/String'
    });

    const statusListener = new ROSLIB.Topic({
      ros: ros,
      name: '/jetbot_mini/state',
      messageType: 'jetbotmini_msgs/State'
    });

    const newStartPublisher = new ROSLIB.Topic({
      ros: ros,
      name: '/jetbot_mini/auto',
      messageType: 'std_msgs/String'
    });

    setStartPublisher(newStartPublisher);

    batteryListener.subscribe((message) => {
      if (message.data !== lastBattery) {
        switch(message.data) {
          case 'Battery_High':
            setRobotBattery(<BatteryFullIcon />);
            break;
          case 'Battery_Medium':
            setRobotBattery(<Battery50Icon />);
            break;
          case 'Battery_Low':
            setRobotBattery(<Battery0BarIcon />);
            break;
          default:
            setRobotBattery('');
        }
        lastBattery = message.data;
      }
    });

    statusListener.subscribe((message) => {
      if (message.state !== lastStatus) {
        switch(message.state) {
          case 'running':
            setRobotStatus(<PlayCircleFilledIcon />);
            break;
          case 'stanby':
            setRobotStatus(<RemoveCircleIcon />);
            break;
          default:
            setRobotStatus('');
        }
        lastStatus = message.state;
      }
    });
  };

  const toggleRobot = () => {
    if (startPublisher) {
      const message = new ROSLIB.Message({
        data: isRunning ? 'stop' : 'start'
      });
      startPublisher.publish(message);
      console.log(message);
      console.log(`${isRunning ? 'Stop' : 'Start'} message published`);
      setIsRunning(!isRunning);
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
    // console.log("NEW :", sentSensorData)
    // console.log("OLD :", sensorData)

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
      // console.log("success!", retval.data[0].avgHumidity)
      setYesterdayData({
        avg_temperature: retval.data[0].avgTemperature.toFixed(1),
        avg_humidity: retval.data[0].avgHumidity.toFixed(1)
      })
      // console.log(avg_temperature)
    }).catch((retval) => {
      console.log("Error@@", retval)
    })
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
            <Grid item xs={4} sm={4} md={4}>
              <StyledCard>
                <StyledCardContent>
                  <CardTitle variant="h5" component="div">
                    현재 온습도
                  </CardTitle>
                  <br />
                  <div>
                    <CardInfo variant="body2" color="text.secondary">
                      온도: {sensorData.temperature}°C
                    </CardInfo>
                    <br />
                    <CardInfo variant="body2" color="text.secondary">
                      습도: {sensorData.humidity}%
                    </CardInfo>
                  </div>
                </StyledCardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
              <StyledCard onClick={handleOpenModal} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                          style={{ height: '100%', cursor: 'pointer', hover: '#ccc'}}>
                {/* <CardActionArea onClick={handleOpenModal} style={{height: '100%'}}> */}
                  <StyledCardContent>
                    <CardTitle variant="h5" component="div">
                      전날 평균 온습도
                    </CardTitle>
                    <br />
                    <div>
                      <CardInfo variant="body2" color="text.secondary">
                        온도: {yesterdayData.avg_temperature}°C
                      </CardInfo>
                      <br />
                      <CardInfo variant="body2" color="text.secondary">
                        습도: {yesterdayData.avg_humidity}%
                      </CardInfo>
                    </div>
                  </StyledCardContent>
                {/* </CardActionArea> */}
              </StyledCard>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
              <StyledCard>
                <StyledCardContent>
                  <CardTitle variant="h5" component="div">
                    Robot Condition
                  </CardTitle>
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
                    isrunning={isRunning.toString()}
                    style={{marginTop: '16px'}}
                  >
                    {isRunning ? 'Stop' : 'Start'}
                  </ToggleButton>
                </StyledCardContent>
              </StyledCard>
            </Grid>
              <Grid item xs={12} md={15}>
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
              <Grid item xs={12} md={15}>
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
              <Grid item xs={12} md={15}>
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
