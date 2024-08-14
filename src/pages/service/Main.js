import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent, CardMedia, Typography, CardActionArea, Grid, Box, Alert, LinearProgress, CircularProgress, Tooltip, Paper, Chip, Button, Badge, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../contexts/AuthContext';
import { topicButtonContext } from '../../App'
import ROSLIB from "roslib"
import ThermostatIcon from '@mui/icons-material/Thermostat';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ModeStandbyIcon from '@mui/icons-material/ModeStandby';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ROSAlarm from '../../components/ROSAlarm';  // ROSAlarm 컴포넌트 import 추가
import NotificationModal from '../../components/NotificationModal';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import RecommendIcon from '@mui/icons-material/Recommend';
import { useResizeDetector } from 'react-resize-detector';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import YesterdayChart from '../../components/YesterdayChart';
import ChartModal from '../../components/ChartModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

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

const CardContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const GaugeContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

const GaugeLabel = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  flex: 1,
}));

const Main = React.memo(() => {
  const navigate = useNavigate();
  const [farmName, setFarmName] = useState('');
  const [robotStatus, setRobotStatus] = useState('');
  const [robotBattery, setRobotBattery] = useState('');
  const [sensorData, setSensorData] = useState({ temperature: null, humidity: null, timestamp: null });
  const [sentSensorData, setSentSensorData] = useState({ temperature: null, humidity: null });
  const [haveToUpdate, setUpdateFlag] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const my_context = useContext(AuthContext);
  const topic_context = useContext(topicButtonContext);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [yesterdayData, setYesterdayData] = useState({ avg_temperature: null, avg_humidity: null });
  const [ros, setRos] = useState(null);
  const [startPublisher, setStartPublisher] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { width, height, ref } = useResizeDetector({
    handleHeight: true,
    refreshMode: 'debounce',
    refreshRate: 300,
  });

  // 전날 온습도 데이터 get
  const [yesterdayAvg, setYesterdayAvg] = useState({ avg_temperature: null, avg_humidity: null });

  useEffect(() => {
    const fetchYesterdayAvg = async () => {
      const uid = localStorage.getItem('uid');
      if (uid) {
        try {
          const response = await axios.get('http://localhost:8080/api/yesterdaySummary', {
            params: { uid: uid }
          });
          const data = response.data[0];
          setYesterdayAvg({
            avg_temperature: parseFloat(data.avgTemperature).toFixed(1),
            avg_humidity: parseFloat(data.avgHumidity).toFixed(1)
          });
        } catch (error) {
          // console.error("Error fetching yesterday's average data:", error);
        }
      }
    };

    fetchYesterdayAvg();
  }, []);

  // 로그인 관련
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("uid", user.uid)
        fetchFarmName(user.uid)
      } else {
        localStorage.setItem("uid", null)
      }
    });
  }, [])
  
  // 유저 이름 get
  const fetchFarmName = async (uid) => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/getFarmName', {
        params: { uid }
      });
      setFarmName(response.data);
      // console.log("name set success")
      // console.log(response.data)
    } catch (error) {
      // console.error("Error fetching farm name:", error);
      setFarmName("아무개");
    }
  };

  // ROS 토픽 연결
  useEffect(() => {
    const newRos = new ROSLIB.Ros({
      url: 'ws://192.168.0.13:9090'
    });

    newRos.on("connection", () => {
      // console.log('웹소켓 서버에 연결되었습니다.');
      setupROSTopics(newRos);
    });

    newRos.on("error", (error) => {
      // console.log('웹소켓 서버 연결 오류: ', error);
    });

    newRos.on("close", () => {
      // console.log('웹소켓 서버 연결이 닫혔습니다.');
    });

    setRos(newRos);

    return () => {
      newRos.close();
    };
  }, []);

  // ROS 토픽 설정
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

 
    const rqDonePublisher = new ROSLIB.Topic({
      ros: ros,
      name: '/qr_code_topic',
      messageType: 'jetbotmini_msgs/Tree'
    });

    // 퍼블리셔
    setStartPublisher(newStartPublisher);

    rqDonePublisher.subscribe((message) => {
      if(message.tree == "autoplay mode is done"){
        
      topic_context.setTopicButton(true)
      }
    })

    // ROS 상태 수신 (배터리, 작동중)
    statesListener.subscribe((message) => {
      // console.log("이것이 메시지 :", message.data)
      const topics = message.data.split(",")
      const batteryTopic = Number(topics[0])
 
      const batteryPercentage = Math.round((batteryTopic / 12.5) * 100);

      setRobotBattery(batteryPercentage)

      if (topics[1] !== lastStatus){
        switch(topics[1]){
          case 'running' :
            setRobotStatus(<DirectionsRunIcon />)
            break;

          case 'standby' :
            setRobotStatus(<ModeStandbyIcon />)
            break;

          default:
            setRobotStatus('')
        }
        lastStatus = topics[1]
      }
    });
  }

  // 알림 추가 함수
  const addNotification = (notification) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now(), timestamp: new Date() }]);
  };

  // 알림 삭제 함수
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // 모든 알림 삭제 함수
  const removeAllNotifications = () => {
    setNotifications([]);
  };

  // 알림 모달 열기
  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
    setIsChartModalOpen(false);  // 차트 모달 닫기
  };

  // 차트 모달 열기
  const openChartModal = () => {
    setIsChartModalOpen(true);
    setIsNotificationModalOpen(false);  // 알림 모달 닫기
  };

  // toggleRobot 함수 수정
  const toggleRobot = () => {
    if (startPublisher) {
      const message = new ROSLIB.Message({
        data: topic_context.topicButton ? 'start' : 'stop'
      });

      // console.log(message);
      // console.log(`${topic_context.topicButton ? 'Start' : 'Stop'} message published`);

      topic_context.setTopicButton(!topic_context.topicButton);
      startPublisher.publish(message);

      // 로봇 상태 변경에 따른 알림 추가
      addNotification({
        severity: topic_context.topicButton ? 'info' : 'warning',
        title: topic_context.topicButton ? '로봇 작동 시작' : '로봇 작동 중지',
        message: topic_context.topicButton ? '로봇이 작동을 시작했습니다.' : '로봇이 작동을 멈췄습니다.'
      });
    } else {
      // console.log('Start publisher not ready');
    }
  };

  // 아두이노 실시간 온습도
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8765');
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log('WebSocket Connected');
      setError(null);
      reconnectAttempts.current = 0; 
    };

    ws.onclose = () => {
      // console.log('WebSocket Disconnected');
    };

    ws.onmessage = (event) => {
      const data = event.data;
      // console.log('Received data from websocket:', data);
      const tempMatch = data.match(/Temperature:\s*([\d.]+)/);
      const humidityMatch = data.match(/Humidity:\s*([\d.]+)/);

      if (tempMatch && humidityMatch) {
        const temperature = parseFloat(tempMatch[1]);
        const humidity = parseFloat(humidityMatch[1]);

        if (!isNaN(temperature) && !isNaN(humidity)) {
          setSentSensorData({ 
            temperature: temperature.toFixed(1), 
            humidity: humidity.toFixed(1),
            timestamp: new Date().toISOString() // 현재 시간을 ISO 문자열로 저장
          });
        } else {
          // console.error('Invalid number in data:', data);
        }
      } else {
        // console.error('Invalid data format received:', data);
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
    // console.log("업데이트 값 :", sensorData)
    axios.post('http://localhost:8080/api/saveData', {
      ...sensorData
    }).then((retVal) => {
      // console.log("Well Saved!", retVal)
    }).catch((retVal) => {
      // console.log("Error!", retVal)
    })
    
    setUpdateFlag(false)
  }, [sensorData])

  // 실시간 시간 업데이트를 위한 useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!yesterdayData) {
    return <div>Loading...</div>;
  }

  // 온습도 변화 추이 계산식
  const getChangeIndicator = (current, yesterday) => {
    if (!current || !yesterday) return <span>데이터 없음</span>;
    const change = (current - yesterday).toFixed(1);
    if (change > 0) {
      return <span style={{ color: 'red' }}>▲{change}</span>;
    } else if (change < 0) {
      return <span style={{ color: 'blue' }}>▼{Math.abs(change)}</span>;
    } else {
      return <span>변화없음</span>;
    }
  };

  // 실시간 온습도 게이지 색 설정
  const getTemperatureColor = (temp) => {
    if (temp < 10) return '#3f51b5'; // 파랑 (춥다)
    if (temp < 20) return '#4caf50'; // 초록 (적정)
    if (temp < 30) return '#ff9800'; // 주황 (따뜻하다)
    return '#f44336'; // 빨강 (덥다)
  };

  const getHumidityColor = (humidity) => {
    if (humidity < 30) return '#f44336'; // 빨강 (건조)
    if (humidity < 50) return '#ff9800'; // 주황 (약간 건조)
    if (humidity < 70) return '#4caf50'; // 초록 (적정)
    return '#3f51b5'; // 파랑 (습함)
  };

  // 추천 조치
  const getRecommendedAction = (temperature, humidity) => {
    if (temperature < 20) {
      return "난방 시설을 가동하여 온도를 높이세요.";
    } else if (temperature > 25) {
      return "환기를 하거나 냉방 시설을 가동하여 온도를 낮추세요.";
    } else if (humidity < 40) {
      return "가습기를 사용하거나 물을 뿌려 습도를 높이세요.";
    } else if (humidity > 60) {
      return "제습기를 사용하거나 환기를 통해 습도를 낮추세요.";
    } else {
      return "현재 환경 조건이 적절합니다. 유지하세요.";
    }
  };

  return (
    <MainContainer>
      <Content>
        <Header>
          <Typography variant="h4" component="h1" gutterBottom>
            {farmName} 님의 농장
          </Typography>
          <Typography variant="subtitle1">
            {currentTime.toLocaleString()}
          </Typography>
        </Header>
        <CardContainer>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={3}>
              {/* 현재 온습도 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <StyledCardContent>
                    <CardTitle variant="h5">
                      <ThermostatIcon sx={{ mr: 1 }} />
                      현재 온습도
                    </CardTitle>
                    
                    {/* 온도 게이지 */}
                    <GaugeContainer elevation={3}>
                      <DeviceThermostatIcon color="error" />
                      <GaugeLabel variant="body1">&nbsp;{sensorData.temperature}°C</GaugeLabel>
                      <Box sx={{ width: '50%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={(sensorData.temperature / 50) * 100}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getTemperatureColor(sensorData.temperature),
                            },
                          }}
                        />
                      </Box>
                    </GaugeContainer>

                    {/* 습도 게이지 */}
                    <GaugeContainer elevation={3}>
                      <OpacityIcon sx={{ mr: 1, color: 'info.main' }} />
                      <GaugeLabel variant="body1">{sensorData.humidity}%</GaugeLabel>
                      <Box sx={{ width: '50%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={sensorData.humidity}
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getHumidityColor(sensorData.humidity),
                            },
                          }}
                        />
                      </Box>
                    </GaugeContainer>

                    {/* 온습도 변화 추이 */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>온습도 변화 추이</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <DeviceThermostatIcon sx={{ mr: 1, color: 'error.main' }} />
                            {getChangeIndicator(parseFloat(sensorData.temperature), parseFloat(yesterdayAvg.avg_temperature))}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <OpacityIcon sx={{ mr: 1, color: 'info.main' }} />
                            {getChangeIndicator(parseFloat(sensorData.humidity), parseFloat(yesterdayAvg.avg_humidity))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* 최적 환경 조건 */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>최적 환경 조건</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <DeviceThermostatIcon sx={{ mr: 1, color: 'error.main' }} />
                            20°C ~ 25°C
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <OpacityIcon sx={{ mr: 1, color: 'info.main' }} />
                            40% ~ 60%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* 추천 조치 */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>추천 조치</Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <RecommendIcon sx={{ mr: 1, color: 'success.main' }} />
                        {getRecommendedAction(sensorData.temperature, sensorData.humidity)}
                      </Typography>
                    </Box>

                    {/* 최근 업데이트 시간 */}
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 2 }}>
                      최근 업데이트: {sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleString() : '업데이트 정보 없음'}
                    </Typography>
                  </StyledCardContent>
                </StyledCard>
              </Grid>

              {/* 전날 평균 온습도 카드 */}
              <Grid item xs={12} md={8}>
                <StyledCard hoverable onClick={() => setIsChartModalOpen(true)}>
                  <StyledCardContent>
                    <CardTitle variant="h5">
                      <InsertChartIcon sx={{ mr: 1 }} />
                      전날 온습도 데이터
                    </CardTitle>
                    <Box sx={{ height: 'calc(100% - 40px)', width: '100%' }}>  {/* 높이를 조정 */}
                      <YesterdayChart />
                    </Box>
                  </StyledCardContent>
                </StyledCard>
              </Grid>
              {/* Robot Condition 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <StyledCardContent>
                    <CardTitle variant="h5">
                      <SmartToyIcon sx={{ mr: 1 }} />
                      Robot Condition
                    </CardTitle>
                    
                    {/* 로봇 상태 표시 */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Tooltip title="로봇 상태">
                        {topic_context.topicButton ? (
                          <StopIcon color="error" sx={{ fontSize: 30, mr: 1 }} />
                        ) : (
                          <PlayArrowIcon color="success" sx={{ fontSize: 30, mr: 1 }} />
                        )}
                      </Tooltip>
                      <Chip 
                        icon={topic_context.topicButton ? <ModeStandbyIcon /> : <DirectionsRunIcon />}
                        label={topic_context.topicButton ? "대기 중" : "작동 중"}
                        color={topic_context.topicButton ? "default" : "success"}
                        sx={{ width: '40%', height: '32px', '& .MuiChip-label': { fontSize: '0.9rem' } }}
                      />
                    </Box>
                    
                    {/* 배터리 상태 표시 */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <Tooltip title="배터리 상태">
                        <BatteryChargingFullIcon sx={{ fontSize: 30, mr: 1, color: 
                          robotBattery > 60 ? '#4caf50' : 
                          robotBattery > 20 ? '#ff9800' : '#f44336'
                        }} />
                      </Tooltip>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <LinearProgress
                          variant="determinate"
                          value={robotBattery}
                          sx={{ 
                            flexGrow: 1,
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: robotBattery > 60 ? '#4caf50' : 
                                               robotBattery > 20 ? '#ff9800' : '#f44336',
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, minWidth: '50px', fontWeight: 'bold' }}>
                          {robotBattery + '%'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* 로봇 제어 버튼 */}
                    <Button
                      variant="contained"
                      onClick={toggleRobot}
                      color={!topic_context.topicButton ? "error" : "success"}
                      fullWidth
                      startIcon={!topic_context.topicButton ? <DirectionsRunIcon /> : <ModeStandbyIcon/>}
                      sx={{ mt: 2, height: '40px', fontSize: '1rem' }}
                    >
                      {!topic_context.topicButton ? '로봇 정지' : '로봇 시작'}
                    </Button>
                  </StyledCardContent>
                </StyledCard>
              </Grid>

              {/* 관리 페이지 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard hoverable>
                  <CardActionArea component={Link} to="/manage" sx={{ height: '100%' }}>
                    <StyledCardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SportsEsportsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          Monitoring
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        실시간 객체 탐지 영상 확인
                      </Typography>
                      {/* 기능 목록 추가 */}
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                          로봇 상태 모니터링
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                          실시간 제어 및 설정
                        </Typography>
                      </Box>
                    </StyledCardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>

              {/* 객체 확인 페이지 카드 */}
              <Grid item xs={12} md={4}>
                <StyledCard hoverable>
                  <CardActionArea component={Link} to="/obj" sx={{ height: '100%' }}>
                    <StyledCardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ViewInArIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                          Detection
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        실시간 객체 탐지 결과 확인
                      </Typography>
                      {/* 기능 목록 추가 */}
                      <Box>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                          탐지된 객체 목록 확인
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
                          객체 분석 및 통계
                        </Typography>
                      </Box>
                    </StyledCardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        </CardContainer>
      </Content>

      {/* ChartModal 컴포넌트 */}
      <ChartModal
        open={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        title="평균 온습도 조회 (90일)"
      />

      {/* 알림 모달 */}
      <NotificationModal
        open={isNotificationModalOpen}
        handleClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        removeNotification={removeNotification}
        removeAllNotifications={removeAllNotifications}
      />

      <ROSAlarm onNotification={addNotification} />
    </MainContainer>
  );
});


export default Main;

