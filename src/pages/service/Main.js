import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import YesterdayData from '../../components/YesterdayData';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';

const MainContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Content = styled('div')({
  width: '100%',
  maxWidth: 1200,
  padding: '20px',
});

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '20px',
});

const CardContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
});

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

  return (
    <MainContainer>
      <Content>
        <Header>
          <input
            type="text"
            placeholder="농장 이름"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
          />
          {/* 알림바 있어야할 자리 */}

        </Header>
        <CardContainer>
          <Card>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  현재 온습도
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  온도: {sensorData.temperature}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  습도: {sensorData.humidity}%
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  전날 평균 온습도
                </Typography>
                <YesterdayData />
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Robot Condition
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  상태: {robotStatus}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  배터리: {robotBattery}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
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
        </CardContainer>
      </Content>
    </MainContainer>
  );
})

export default Main;