import React, { useState, useEffect, useContext } from 'react';
import { Tabs, Tab, Button, useMediaQuery, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ROSLIB from 'roslib';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { topicButtonContext } from '../../App'

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
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '10px',
    width: '200px',
    height: '200px',
    zIndex: 1,
});

const ControlButton = styled(Button)(({ theme }) => ({
    minWidth: '100%',
    height: '100%',
    fontSize: '15px',
    opacity: '0.7',
    padding: 0,
    '&:hover': {
        opacity: 1,
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '12px',
    },
}));

// 커스텀 Tabs 컴포넌트
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

// 커스텀 Tab 컴포넌트
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 200,
  fontWeight: theme.typography.fontWeightRegular,
  color: theme.palette.text.primary,
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 0.8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
  borderRight: `1px solid ${theme.palette.divider}`,
  borderLeft: `1px solid ${theme.palette.divider}`
}));

const ImageContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '600px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  [theme.breakpoints.down('sm')]: {
    height: '400px',
  },
}));

function Manage(){
    const [alignment, setAlignment] = useState('auto');
    const [currentImage, setCurrentImage] = useState('http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw');
    const [controlPanel, setControlPanel] = useState(false);
    const [ros, setRos] = useState(null);
    const [motorService, setMotorService] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const topic_context = useContext(topicButtonContext);

    // 영상 설정
    useEffect(() => {
        setCurrentImage(
            alignment === 'auto' ?
            'http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw' :
            'http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw'
        )
        setControlPanel(alignment === 'control')
    }, [alignment])

    // ROS 연결
    useEffect(() => {
        const ros = new ROSLIB.Ros({
            url: 'ws://192.168.0.13:9090'
        });

        ros.on('connection', () => {
            // console.log('웹소켓 서버에 연결되었습니다.');
        });

        ros.on('error', (error) => {
            // console.log('웹소켓 서버 연결 오류: ', error);
        });

        ros.on('close', () => {
            // console.log('웹소켓 서버 연결이 닫혔습니다.');
        });

        // ROS 토픽 설정
        const motorServiceInstance = new ROSLIB.Service({
            ros: ros,
            name: '/handling',
            serviceType: '/jetbotmini_msgs/Motor'
        });

        const controlTopic = new ROSLIB.Topic({
            ros: ros,
            name: './control',
            messageType: 'std_msgs/String'
        });

        setRos(ros);
        setMotorService(motorServiceInstance);

        return () => {
            if (ros) {
                ros.close();
            }
        };
    }, []);

    // auto, control 토글 설정
    const handleChange = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    // 젯봇미니 서비스 통신 (조종)
    const handleControl = (direction) => {
        if (!motorService) return;

        let rightspeed = 0.0;
        let leftspeed = 0.0;

        switch (direction) {
            case 'forward':
                rightspeed = 0.5;
                leftspeed = 0.5;
                // console.log('forward');
                break;
            case 'backward':
                rightspeed = -0.5;
                leftspeed = -0.5;
                // console.log('backward');
                break;
            case 'left':
                rightspeed = -0.5;
                leftspeed = 0.5;
                // console.log('left');
                break;
            case 'right':
                rightspeed = 0.5;
                leftspeed = -0.5;
                // console.log('right');
                break;
            case 'stop':
                rightspeed = 0.0;
                leftspeed = 0.0;
                // console.log('stop');
                break;
            default:
                break;
        }

        topic_context.setTopicButton(true)

        const request = new ROSLIB.ServiceRequest({
            rightspeed: rightspeed,
            leftspeed: leftspeed
        });

        motorService.callService(request, (result) => {
            // console.log('Result for service call on ', direction, ': ', result);
        });
    };

    // 키보드 이벤트 리스너 추가
    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'w':
                case 'W':
                    handleControl('forward');
                    break;
                case 'a':
                case 'A':
                    handleControl('left');
                    break;
                case 's':
                case 'S':
                    handleControl('backward');
                    break;
                case 'd':
                case 'D':
                    handleControl('right');
                    break;
                case ' ':
                    handleControl('stop');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [motorService]);

    return(
        <MainContainer>
            <StyledTabs 
                value={alignment} 
                onChange={handleChange} 
                aria-label="Platform"
            >
                <StyledTab value="auto" label="Auto" icon={<AutorenewIcon />} style={{ width: '200px', fontWeight: 'bold'}} />
                <StyledTab value="control" label="Hands-on" icon={<SportsEsportsIcon />} style={{ width: '200px', marginRight: 'auto', fontWeight: 'bold'}} />
                {/* {alignment === 'control' && (
                    <StyledButton>운행종료</StyledButton>
                )} */}
            </StyledTabs>
            <br />
            <CardContainer>
                <ImageContainer 
                    style={{
                        backgroundImage: `url(${currentImage})`,
                    }}
                >
                    {alignment === 'control' && (
                        <ControlPanel>
                            <div></div>
                            <ControlButton onClick={() => handleControl('forward')} variant="contained" color="primary">▲</ControlButton>
                            <div></div>
                            <ControlButton onClick={() => handleControl('left')} variant="contained" color="primary">◀</ControlButton>
                            <ControlButton 
                                onClick={() => handleControl('stop')} 
                                variant="contained" 
                                style={{
                                    backgroundColor: theme.palette.error.main,
                                    color: theme.palette.common.white,
                                    '&:hover': {
                                        backgroundColor: theme.palette.error.dark,
                                    },
                                }}
                            >
                                STOP
                            </ControlButton>
                            <ControlButton onClick={() => handleControl('right')} variant="contained" color="primary">▶</ControlButton>
                            <div></div>
                            <ControlButton onClick={() => handleControl('backward')} variant="contained" color="primary">▼</ControlButton>
                            <div></div>
                        </ControlPanel>
                    )}
                </ImageContainer>
            </CardContainer>
        </MainContainer>
    )
}

export default Manage;