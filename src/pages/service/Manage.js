import React, { useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button'
import ROSLIB from 'roslib';

const MainContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    padding: '100px 20px 20px',
});

const CardContainer = styled('div')({
    position: 'relative',
    width: '100%',
});

const ControlPanel = styled('div')({
    position: 'absolute',
    top: '80%',
    left: '20px',
    transform: 'translateY(-50%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '10px',
    width: '200px',
    height: '200px',
    zIndex: 1,
});

const ControlButton = styled(Button)({
    minWidth: '100%',
    height: '100%',
    fontSize: '15px',
    opacity: '0.5'
});

function Manage(){
    const [alignment, setAlignment] = React.useState('auto');
    const [currentImage, setCurrentImage] = React.useState('http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw');
    const [controlPanel, setControlPanel] = React.useState(false);
    const [ros, setRos] = useState(null);
    const [motorService, setMotorService] = useState(null);

    useEffect(() => {
        setCurrentImage(
            alignment === 'auto' ?
            'http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw' :
            'http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw'
        )
        setControlPanel(alignment === 'control')
    }, [alignment])

    useEffect(() => {
        // ROS에 연결
        const ros = new ROSLIB.Ros({
            url: 'ws://192.168.0.13:9090'
        });

        ros.on('connection', () => {
            console.log('웹소켓 서버에 연결되었습니다.');
        });

        ros.on('error', (error) => {
            console.log('웹소켓 서버 연결 오류: ', error);
        });

        ros.on('close', () => {
            console.log('웹소켓 서버 연결이 닫혔습니다.');
        });

        const motorServiceInstance = new ROSLIB.Service({
            ros: ros,
            name: '/motor',
            serviceType: '/jetbotmini_msgs/Motor'
        });

        setRos(ros);
        setMotorService(motorServiceInstance);

        return () => {
            if (ros) {
                ros.close();
            }
        };
    }, []);

    const handleChange = (event, newAlignment) => {
        console.log(newAlignment)
        setAlignment(newAlignment);
    };

    const handleControl = (direction) => {
        if (!motorService) return;

        let rightspeed = 0.0;
        let leftspeed = 0.0;

        switch (direction) {
            case 'forward':
                rightspeed = 0.5;
                leftspeed = 0.5;
                console.log('forward')
                break;
            case 'backward':
                rightspeed = -0.5;
                leftspeed = -0.5;
                console.log('backward')
                break;
            case 'left':
                rightspeed = -0.5;
                leftspeed = 0.5;
                console.log('left')
                break;
            case 'right':
                rightspeed = 0.5;
                leftspeed = -0.5;
                console.log('right')
                break;
            case 'stop':
                rightspeed = 0.0;
                leftspeed = 0.0;
                console.log('stop')
                break;
            default:
                break;
        }

        const request = new ROSLIB.ServiceRequest({
            rightspeed: rightspeed,
            leftspeed: leftspeed
        });

        motorService.callService(request, (result) => {
            console.log('Result for service call on ', direction, ': ', result);
        });
    };

    return(
        <MainContainer>
            <ToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleChange}
                aria-label="Platform"
                >
                <ToggleButton value="auto" style={{ width: '200px'}}>Auto</ToggleButton>
                <ToggleButton value="control" style={{ width: '200px'}}>Hands-on</ToggleButton>
            </ToggleButtonGroup>
            <br />
            <CardContainer>
                <Card style={{ width: '100%', height: '600px', textAlign:'center'}}>
                    <img src={currentImage}
                        alt='영상'
                        onError={(e) => e.target.src= "/video.png"}
                        style={{ width: '100%', height: '100%' }}/>
                </Card>
                {alignment === 'control' && (
                    <ControlPanel>
                        <div></div>
                        <ControlButton onClick={() => handleControl('forward')} variant="contained">▲</ControlButton>
                        <div></div>
                        <ControlButton onClick={() => handleControl('left')} variant="contained">◀</ControlButton>
                        <ControlButton onClick={() => handleControl('stop')} variant="contained">STOP</ControlButton>
                        <ControlButton onClick={() => handleControl('right')} variant="contained">▶</ControlButton>
                        <div></div>
                        <ControlButton onClick={() => handleControl('backward')} variant="contained">▼</ControlButton>
                        <div></div>
                    </ControlPanel>
                )}
            </CardContainer>
        </MainContainer>
    )
}

export default Manage;