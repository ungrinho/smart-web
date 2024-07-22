// import React from 'react';


// const MainPage = React.memo(function(){

//     return <>하이루</>
// })

// export default MainPage;




// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import styled from 'styled-components';
// import axios from 'axios';
// import { auth } from '../../config/firebase';
// import { Link, useNavigate } from 'react-router-dom';
// import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, onAuthStateChanged, browserSessionPersistence, signOut} from 'firebase/auth';
// import YesterdayData from '../../components/YesterdayData';
// import Card from '../../components/Card'

// const MainContainer = styled.div`
//   display: flex;
//   flex-direction: column;

//   @media (min-width: 768px) {
//     flex-direction: row;
//   }
// `;


// const Content = styled.div`
//   flex: 1;
//   padding: 20px;
// `;

// const Header = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 20px;
//   margin-left: 210px;
// `;



// const LogoutButton = styled.button`
//   background-color: #f44336;
//   color: white;
//   padding: 10px;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   margin-top: 20px;
// `;


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


//   // 로그아웃
//   const onLogoutClick = async () => {
//     try {
//       await signOut(auth);
//       navigate('/');
//     } catch (error) {
//       console.error("로그아웃 중 오류 발생:", error);
//     }
//   };

  
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
//   useEffect(() =>{

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
//   useEffect(() =>{

//     // console.log("usememo called")
//     console.log("업데이트 값 :", sensorData)
//     axios.post('http://localhost:8080/api/saveData', {
//       ...sensorData
//     }).then((retVal) => {
//       console.log("Well Done!", retVal)
//     }).catch((retVal) => {
//       console.log("Error!", retVal)
//     })
    

//     //setSensorData

//     setUpdateFlag(false)
//   }, [sensorData])


//   return (
//     <MainContainer>
//       <Content>
//         <Header>
//           <input
//             type="text"
//             placeholder="농장 이름"
//             value={farmName}
//             onChange={(e) => setFarmName(e.target.value)}
//           />
//           <div>
//             {/* 알림 바 (주석 처리) */}
//             {/* <NotificationBar /> */}
//           </div>
//         </Header>
//         <Card>
//           <h3>현재 온습도</h3>
//           <p>온도: {sensorData.temperature}°C</p>
//           <p>습도: {sensorData.humidity}%</p>
//           <h3>전날 평균 온습도</h3>
//           <YesterdayData />
//         </Card>
//         <Card>
//           <h3>Robot Condition</h3>
//           <p>상태: {robotStatus}</p>
//           <p>배터리: {robotBattery}</p>
//           {/* <p>배터리: {batteryLevel !== null ? `${batteryLevel}%` : 'Loading...'}</p>  // ros 연결 시 다시 ㄱㄱ */}
//         </Card>
//         <Card>
//           <h3>관리 페이지</h3>
//           <Link to="/manage">이동하기</Link>
//           {/* 사진 추가 (주석 처리) */}
//           {/* <img src="/path/to/image.jpg" alt="관리 페이지" /> */}
//         </Card>

//         <Card>
//           <h3>객체 확인 페이지</h3>
//           <Link to="/obj">이동하기</Link>
//           {/* 사진 추가 (주석 처리) */}
//           {/* <img src="/path/to/image.jpg" alt="객체 확인 페이지" /> */}
//         </Card>
//         <Card>
//           <h3>CS 페이지</h3>
//           <Link to="/cs">이동하기</Link>
//         </Card>
//       </Content>
//     </MainContainer>
//   );
// })

// export default Main;


///////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, onAuthStateChanged, browserSessionPersistence, signOut} from 'firebase/auth';
import YesterdayData from '../../components/YesterdayData';


const MainContainer = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

// const Sidebar = styled.div`
//   width: 100%;
//   background-color: #4CAF50;
//   padding: 20px;

//   @media (min-width: 768px) {
//     width: 200px;
//   }
// `;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;


const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-left: 210px;
`;

// const Card = styled.div`
//   display: flex;
//   flex-direction: column;
//   border: 1px solid #ddd;
//   padding: 20px;
//   margin-bottom: 20px;
//   border-radius: 4px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//   margin-left: 210px;
//   @media (min-width: 1024px) {
//     width: calc(50% - 10px);
//     display: inline-block;
//     margin-right: 20px;

//     &:nth-child(2n) {
//       margin-right: 0;
//     }
//   }
// `;

const Card = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 210px;

  @media (min-width: 1024px) {
    width: calc(50% - 10px);
    display: inline-block;
    margin-right: 20px;

    &:nth-child(2n) {
      margin-right: 0;
    }
  }
`;


const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
`;


const MainPage = React.memo(() => {
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


  // 로그아웃
  const onLogoutClick = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  
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
  useEffect(() =>{

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
  useEffect(() =>{

    // console.log("usememo called")
    console.log("업데이트 값 :", sensorData)
    axios.post('http://localhost:8080/api/saveData', {
      ...sensorData
    }).then((retVal) => {
      console.log("Well Done!", retVal)
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
          <div>
            {/* 알림 바 (주석 처리) */}
            {/* <NotificationBar /> */}
          </div>
        </Header>
        <Card>
          <h3>현재 온습도</h3>
          <p>온도: {sensorData.temperature}°C</p>
          <p>습도: {sensorData.humidity}%</p>
          <h3>전날 평균 온습도</h3>
          <YesterdayData />
        </Card>
        <Card>
          <h3>Robot Condition</h3>
          <p>상태: {robotStatus}</p>
          <p>배터리: {robotBattery}</p>
          {/* <p>배터리: {batteryLevel !== null ? `${batteryLevel}%` : 'Loading...'}</p>  // ros 연결 시 다시 ㄱㄱ */}
        </Card>
        <Card>
          <h3>관리 페이지</h3>
          <Link to="/manage">이동하기</Link>
          {/* 사진 추가 (주석 처리) */}
          {/* <img src="/path/to/image.jpg" alt="관리 페이지" /> */}
        </Card>

        <Card>
          <h3>객체 확인 페이지</h3>
          <Link to="/obj">이동하기</Link>
          {/* 사진 추가 (주석 처리) */}
          {/* <img src="/path/to/image.jpg" alt="객체 확인 페이지" /> */}
        </Card>
        <Card>
          <h3>CS 페이지</h3>
          <Link to="/cs">이동하기</Link>
        </Card>
      </Content>
    </MainContainer>
  );
})

export default MainPage;

