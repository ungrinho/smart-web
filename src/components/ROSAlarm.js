import { useEffect, useState } from "react";
import ROSLIB from "roslib";

function ROSAlarm({ onNotification }) {
  const [currentBatteryStatus, setCurrentBatteryStatus] = useState(null);
  const [currentDriveStatus, setCurrentDriveStatus] = useState(null);
  const [currentStandbyStatus, setCurrentStandbyStatus] = useState(null);

  useEffect(() => {
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

      // 대기 상태 토픽 구독
      const standbyListener = new ROSLIB.Topic({
        ros: ros,
        name: '/jetbot_mini/standby_status',
        messageType: 'std_msgs/String'
      });

      standbyListener.subscribe((message) => {
        handleStandbyStatus(message.data);
      });
    };

    // 배터리 상태 처리 함수
    const handleBatteryStatus = (status) => {
      if (status !== currentBatteryStatus) {
        setCurrentBatteryStatus(status);
        switch (status) {
          case 'Battery_High':
            onNotification({
              severity: 'success',
              title: '배터리 상태 양호',
              message: '로봇의 배터리 잔량이 충분합니다.'
            });
            break;
          case 'Battery_Medium':
            onNotification({
              severity: 'info',
              title: '배터리 상태 보통',
              message: '로봇의 배터리 잔량이 절반 정도 남았습니다.'
            });
            break;
          case 'Battery_Low':
            onNotification({
              severity: 'warning',
              title: '배터리 부족',
              message: '로봇의 배터리 잔량이 얼마 남지 않았습니다. 충전이 필요합니다.'
            });
            break;
          default:
            onNotification({
              severity: 'error',
              title: '배터리 상태 불명',
              message: '로봇의 배터리 상태를 확인할 수 없습니다.'
            });
            break;
        }
      }
    };

    // 주행 상태 처리 함수
    const handleDriveStatus = (status) => {
      if (status !== currentDriveStatus) {
        setCurrentDriveStatus(status);
        if (status === 'Drive_Completed') {
          onNotification({
            severity: 'success',
            title: '객체 탐지 완료!',
            message: '로봇이 순찰을 완료하였습니다. 총 n개의 이상이 감지되었습니다.'
          });
        }
      }
    };

    // 대기 상태 처리 함수
    const handleStandbyStatus = (status) => {
      if (status !== currentStandbyStatus) {
        setCurrentStandbyStatus(status);
        if (status === 'stanby') {
          onNotification({
            severity: 'info',
            title: '대기 상태',
            message: '로봇이 대기 상태입니다.'
          });
        }
      }
    };

    ROSConnect();

    return () => {
      if (ros) {
        ros.close();
      }
    };
  }, [onNotification, currentBatteryStatus, currentDriveStatus, currentStandbyStatus]);

  return null;
}

export default ROSAlarm;