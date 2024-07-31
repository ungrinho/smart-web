import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Alert, AlertTitle } from '@mui/material';
import ROSLIB from "roslib";
import "../App.css";

// 모달 스타일 정의 (구글 스타일 참고)
const style = {
  position: 'absolute',       // 모달을 절대 위치로 설정
  top: '57px',                // 구글 모달의 상단 위치
  right: '12px',              // 구글 모달의 오른쪽 위치
  width: 'calc(100% - 24px)', // 화면 너비에서 양쪽 마진을 뺀 값
  maxWidth: '400px',          // 최대 너비 설정
  zIndex: 991,                // 구글 모달의 z-index
  bgcolor: 'background.paper', // 배경색 설정
  boxShadow: 24,              // 그림자 효과
  p: 2,                       // 패딩 설정
  borderRadius: '8px',        // 테두리 둥글게 설정
  transition: 'all 0.1s ease-out', // 애니메이션 효과 추가
  opacity: 0,                 // 초기 투명도 설정
  visibility: 'hidden',       // 초기 감춤 설정
};

// 모달이 열릴 때 스타일을 변경하는 함수
const getOpenStyle = (isOpen) => ({
  ...style,
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
});

// 알림 모달 컴포넌트
const NotificationModal = ({ open, handleClose, notifications, onNotification }) => {
  useEffect(() => {
    // ROS 연결 설정
    const ros = new ROSLIB.Ros({
      url: 'ws://192.168.0.13:9090'
    });

    const ROSConnect = () => {
      try {
        ros.on("connection", () => {
          console.log("Connected to websocket server.");
          subscribeToTopics(ros);
        });
        ros.on("error", (error) => {
          console.log("Error connecting to websocket server:", error);
        });
        ros.on("close", () => {
          console.log("Connection to websocket server closed.");
        });
      } catch (error) {
        console.log("Failed to construct websocket. The URL is invalid:", error);
      }
    };

    const subscribeToTopics = (ros) => {
      // 배터리 상태 토픽 구독
      const batteryListener = new ROSLIB.Topic({
        ros: ros,
        name: '/jetbot_mini/battery',
        messageType: 'std_msgs/String'
      });

      batteryListener.subscribe((message) => {
        handleBatteryStatus(message.data);
      });

      // 주행 완료 토픽 구독
      const driveListener = new ROSLIB.Topic({
        ros: ros,
        name: '/jetbot_mini/drive_status',
        messageType: 'std_msgs/String'
      });

      driveListener.subscribe((message) => {
        handleDriveStatus(message.data);
      });
    };

    // 배터리 상태 처리 함수
    const handleBatteryStatus = (status) => {
      switch (status) {
        case 'Battery_Low':
          onNotification({ severity: 'warning', title: '배터리 부족', message: '로봇의 배터리 잔량이 얼마 남지 않았습니다.' });
          break;
        case 'Battery_Empty':
          onNotification({ severity: 'error', title: '배터리 방전', message: '로봇의 배터리가 방전되었습니다.' });
          break;
        default:
          break;
      }
    };

    // 주행 상태 처리 함수
    const handleDriveStatus = (status) => {
      if (status === 'Drive_Completed') {
        onNotification({ severity: 'success', title: '객체 탐지 완료!', message: '로봇이 순찰을 완료하였습니다. 총 n개의 이상이 감지되었습니다.' });
      }
    };

    ROSConnect();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (ros) {
        ros.close();
      }
    };
  }, [onNotification]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={getOpenStyle(open)}>
        <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
          알림
        </Typography>
        {notifications.map((notification, index) => (
          <Alert key={index} severity={notification.severity} sx={{ mb: 2 }}>
            <AlertTitle>{notification.title}</AlertTitle>
            {notification.message}
          </Alert>
        ))}
      </Box>
    </Modal>
  );
};

export default NotificationModal;