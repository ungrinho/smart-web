import { useEffect, useState } from "react";
import ROSLIB from "roslib";

function ROSAlarm({ onNotification }) {
  const [currentBatteryStatus, setCurrentBatteryStatus] = useState(null);
  const [currentDriveStatus, setCurrentDriveStatus] = useState(null);

  useEffect(() => {
    // ROS 연결 설정
    const ros = new ROSLIB.Ros({
      url: 'ws://192.168.0.13:9090'
    });

    const ROSConnect = () => {
      try {
        ros.on("connection", () => {
          // console.log("Connected to websocket server.");
          subscribeToTopics(ros);
        });
        ros.on("error", (error) => {
          // console.log("Error connecting to websocket server:", error);
        });
        ros.on("close", () => {
          // console.log("Connection to websocket server closed.");
        });
      } catch (error) {
        // console.log("Failed to construct websocket. The URL is invalid:", error);
      }
    };

    const subscribeToTopics = (ros) => {
      const statesListener = new ROSLIB.Topic({
        ros: ros,
        name: '/jetbot_mini/states',
        messageType: 'std_msgs/String'
      });

      statesListener.subscribe((message) => {
        // console.log("Received message:", message.data);
        const topics = message.data.split(",");
        handleBatteryStatus(topics[0]);
        handleDriveStatus(topics[1]);
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

    // 주행 상태 처리 함수 수정
    const handleDriveStatus = (status) => {
      if (status !== currentDriveStatus) {
        setCurrentDriveStatus(status);
        switch (status) {
          case 'running':
            onNotification({
              severity: 'info',
              title: '로봇 작동 중',
              message: '로봇이 작동을 시작했습니다.'
            });
            break;
          case 'standby':
            onNotification({
              severity: 'warning',
              title: '로봇 대기 중',
              message: '로봇이 작동을 멈췄습니다.'
            });
            break;
          case 'Drive_Completed':
            onNotification({
              severity: 'success',
              title: '객체 탐지 완료!',
              message: '로봇이 순찰을 완료하였습니다. 익은 토마토의 개수는 총 {}개 입니다.'
            });
            break;
          default:
            break;
        }
      }
    };

    ROSConnect();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (ros) {
        ros.close();
      }
    };
  }, [onNotification, currentBatteryStatus, currentDriveStatus]);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}

export default ROSAlarm;