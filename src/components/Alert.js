// import React from 'react';
// import { SnackbarProvider, useSnackbar } from 'notistack';
// import { Button, Alert, AlertTitle } from '@mui/material';
// import { Slide } from '@mui/material';

// // 슬라이드 트랜지션을 위한 함수
// function SlideTransition(props) {
//   return <Slide {...props} direction="left" />;
// }

// // 알림 내용을 렌더링하는 컴포넌트
// const AlertContent = ({ severity, title, message }) => (
//   <Alert severity={severity} variant="filled">
//     <AlertTitle>{title}</AlertTitle>
//     {message}
//   </Alert>
// );


// // 알림을 표시하는 컴포넌트
// function Notifications() {
//   const { enqueueSnackbar } = useSnackbar();

//   // 각 알림 유형에 대한 핸들러
//   const handleNotification = (severity, title, message) => () => {
//     enqueueSnackbar(
//       <AlertContent severity={severity} title={title} message={message} />,
//       {
//         variant: severity,
//         anchorOrigin: { vertical: 'top', horizontal: 'right' },
//         TransitionComponent: SlideTransition,
//       }
//     );
//   };

//   return (
//     <React.Fragment>
//       {/* 성공 알림 버튼 */}
//       <Button onClick={handleNotification('success', '객체 탐지 완료!', '로봇이 순찰을 완료하였습니다.')}>
//         성공 알림
//       </Button>

//       {/* 정보 알림 버튼 */}
//       <Button onClick={handleNotification('info', '객체 이상 감지', '객체 이상을 감지하였습니다.')}>
//         정보 알림
//       </Button>

//       {/* 경고 알림 버튼 */}
//       <Button onClick={handleNotification('warning', '배터리 부족', '로봇의 배터리 잔량이 얼마 남지 않았습니다.')}>
//         경고 알림
//       </Button>

//       {/* 오류 알림 버튼 */}
//       <Button onClick={handleNotification('error', '배터리 방전', '로봇의 배터리가 방전되었습니다.')}>
//         오류 알림
//       </Button>
//     </React.Fragment>
//   );
// }

// // 메인 컴포넌트
// export default function CustomAlerts() {
//   return (
//     // SnackbarProvider로 앱을 감싸 notistack 설정
//     <SnackbarProvider
//       maxSnack={3} // 동시에 표시될 수 있는 최대 알림 수
//       autoHideDuration={3000} // 알림이 자동으로 사라지는 시간 (밀리초)
//     >
//       <Notifications />
//     </SnackbarProvider>
//   );
// }





// import React, { createContext, useState, useContext } from 'react';
// import { Snackbar, Alert as MuiAlert } from '@mui/material';

// // 알림 컨텍스트 생성
// const AlertContext = createContext();

// // 알림 제공자 컴포넌트
// export function AlertProvider({ children }) {
//   const [alert, setAlert] = useState(null);

//   // 알림을 표시하는 함수
//   const showAlert = (severity, message) => {
//     setAlert({ severity, message });
//   };

//   // 알림을 닫는 함수
//   const closeAlert = () => {
//     setAlert(null);
//   };

//   return (
//     <AlertContext.Provider value={{ showAlert }}>
//       {children}
//       <Snackbar
//         open={!!alert}
//         autoHideDuration={6000}
//         onClose={closeAlert}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//       >
//         {alert && (
//           <MuiAlert
//             elevation={6}
//             variant="filled"
//             severity={alert.severity}
//             onClose={closeAlert}
//           >
//             {alert.message}
//           </MuiAlert>
//         )}
//       </Snackbar>
//     </AlertContext.Provider>
//   );
// }

// // 알림 훅
// export function useAlert() {
//   return useContext(AlertContext);
// }






// 필요한 모듈 import
import React, { createContext, useState, useContext } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import Slide from "@mui/material/Slide";

// Alert 컨텍스트 생성
const AlertContext = createContext();

// AlertProvider 컴포넌트 정의
const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message) => {
    const newAlert = {
      message,
      open: true,
    };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
  };

  const closeAlert = (index) => {
    setAlerts((prevAlerts) => {
      const updatedAlerts = [...prevAlerts];
      updatedAlerts[index].open = false;
      return updatedAlerts;
    });
  };

  const AlertComponents = alerts.map((alert, index) => (
    <Snackbar
      key={index}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      open={alert.open}
      onClose={() => closeAlert(index)}
      autoHideDuration={3000}
    >
      <Slide direction="right">
        <Alert
          severity="warning"
          icon={<VerifiedOutlinedIcon />}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: "1.5em",
            textAlign: "center",
            background: "#fdf3e4",
            opacity: "0.2",
            color: "#ff9800",
            fontSize: "1em",
          }}
        >
          <AlertTitle>알림!</AlertTitle>
          {alert.message}
        </Alert>
      </Slide>
    </Snackbar>
  ));

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      {AlertComponents}
    </AlertContext.Provider>
  );
};

// 커스텀 훅 useAlert 정의
const useAlert = () => {
  const { addAlert } = useContext(AlertContext);
  return { addAlert };
};

export { AlertProvider, useAlert };


