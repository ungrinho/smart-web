import { useEffect } from "react";
import ROSLIB from "roslib";

function ROSAlarm({ onNotification }) {
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
          onNotification({
            severity: 'warning',
            title: '배터리 부족',
            message: '로봇의 배터리 잔량이 얼마 남지 않았습니다.'
          });
          break;
        case 'Battery_Empty':
          onNotification({
            severity: 'error',
            title: '배터리 방전',
            message: '로봇의 배터리가 방전되었습니다.'
          });
          break;
        // 다른 배터리 상태에 대한 처리를 추가할 수 있습니다.
      }
    };

    // 주행 상태 처리 함수
    const handleDriveStatus = (status) => {
      if (status === 'Drive_Completed') {
        onNotification({
          severity: 'success',
          title: '객체 탐지 완료!',
          message: '로봇이 순찰을 완료하였습니다. 총 n개의 이상이 감지되었습니다.'
        });
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

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}

export default ROSAlarm;
