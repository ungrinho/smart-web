import React, { useEffect, useState } from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import Badge from '@mui/material/Badge';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import NotificationModal from './NotificationModal';



// 커스텀 테마 생성
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#86d16a', // 메인 색상을 #86d16a로 설정
      light: '#a8dd94', // 밝은 버전
      dark: '#5e9249', // 어두운 버전
    },
    background: {
      default: '#f0f8ed', // 배경색을 연한 녹색으로 설정
    },
  },
});

const drawerWidth = 240;  

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // 앱 바 아래에 컨텐츠가 있도록 하는 데 필요합니다.
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// styled를 사용하여 MuiDrawer를 커스터마이징하고, 새로운 StyledDrawer 컴포넌트를 정의합니다.
const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);



// MiniDrawer 컴포넌트는 애플리케이션의 기본 레이아웃을 담당합니다.
// export default function
export default function MiniDrawer({ children }) {
  const theme = useTheme();  // MUI 테마를 가져옵니다.
  const [open, setOpen] = React.useState(false);  // Drawer의 열림 상태를 관리하는 상태 변수입니다.
  const navigate = useNavigate();  // 페이지 네비게이션을 위해 useNavigate 훅을 사용합니다.
  const [notificationCount, setNotificationCount] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  

  const handleDrawerOpen = () => {
    setOpen(true);  // Drawer를 여는 함수입니다.
  };

  const handleDrawerClose = () => {
    setOpen(false);  // Drawer를 닫는 함수입니다.
  };


  // 로그아웃 함수
  const onLogoutClick = async () => {
    try {
      await signOut(auth);  // Firebase 인증에서 로그아웃합니다.
      setUser(null);  // 로그아웃 후 사용자 정보를 null로 설정합니다.
      navigate('/');  // 로그아웃 후 홈으로 이동합니다.
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);  // 로그아웃 중 에러가 발생하면 콘솔에 출력합니다.
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("현재 로그인 중인 유저의 uid :", currentUser.uid);
        localStorage.setItem("uid", currentUser.uid);  // 사용자 uid를 로컬 스토리지에 저장합니다.
      } else {
        console.log("로그인 유저가 없습니다!");
        localStorage.setItem("uid", null);  // 사용자가 없으면 uid를 null로 설정합니다.
      }
    });
  
    return () => unsubscribe();
  }, []);

  // 메뉴 항목 정의
  const menuItems = [
    { text: '홈', icon: <HomeIcon />, path: '/main' },
    { text: '객체 확인 페이지', icon: <ControlCameraIcon />, path: '/obj' },
    { text: '관리페이지', icon: <FormatListBulletedIcon />, path: '/manage' },
    { text: '고객 문의', icon: <ChatIcon />, path: '/cs' },
  ];

  // 알림 데이터
  const notifications = [
    { severity: 'success', title: '객체 탐지 완료!', message: '로봇이 순찰을 완료하였습니다.' },
    { severity: 'info', title: '객체 이상 감지', message: '객체 이상을 감지하였습니다.' },
    { severity: 'warning', title: '배터리 부족', message: '로봇의 배터리 잔량이 얼마 남지 않았습니다.' },
    { severity: 'error', title: '배터리 방전', message: '로봇의 배터리가 방전되었습니다.' },
  ];

  // 모달을 여는 핸들러
  const handleModalOpen = () => {
    setModalOpen(true);
    setNotificationCount(0); // 모달을 열 때 알림 카운트 리셋
  };

  // 모달을 닫는 핸들러
  const handleModalClose = () => {
    setModalOpen(false);
  };
  
  // 알림 버튼 클릭 핸들러 수정
  const handleNotificationClick = () => {
    // 모달의 상태를 토글합니다.
    setModalOpen(prevState => !prevState);
    // 모달이 열릴 때만 알림 카운트를 리셋합니다.
    if (!modalOpen) {
      setNotificationCount(0);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open} sx={{ backgroundColor: 'primary.main' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Farm Management
            </Typography>
            <IconButton color="inherit" onClick={handleModalOpen}> 
              <Badge badgeContent={notificationCount} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <StyledDrawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          {/* 메뉴 항목 */}
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <ListItem sx={{ justifyContent: 'center' }}>
            {open ? 
              <button size="small" onClick={onLogoutClick}>Sign Out</button> :
              <button size="small" className="thin" onClick={onLogoutClick}>
                <LogoutIcon />
              </button>
            }
          </ListItem>
          {/* {user && ( // user가 존재할 때만 사용자 정보를 표시합니다.
            <Box sx={{ p: 2 }}>
              <Typography variant="body1">Email: {user.email}</Typography>
            </Box>
          )} */}
        </StyledDrawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }}>
          <DrawerHeader />
          {children}  {/* 자식 컴포넌트를 렌더링합니다. */}
        </Box>
        <NotificationModal
          open={modalOpen}
          handleClose={handleModalClose}
          notifications={notifications}
        />
      </Box>
    </ThemeProvider>
  );
}

