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
import ROSAlarm from './ROSAlarm';

// Custom theme created
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#86d16a', // Main color set to #86d16a
      light: '#a8dd94', // Light version
      dark: '#5e9249', // Dark version
    },
    background: {
      default: '#f0f8ed', // Background color set to light green
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
  // Needed for content to be below the app bar.
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

// Styled MuiDrawer component defined using styled
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

export default function MiniDrawer({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (newNotification) => {
    setNotifications(prev => [
      ...prev, 
      {
        ...newNotification,
        id: Date.now(),
        timestamp: new Date().getTime()
      }
    ]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const removeAllNotifications = () => {
    setNotifications([]);
  };

  // Notification count calculated
  const notificationCount = notifications.length;

  // Drawer open/close handlers
  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  // Logout function
  const onLogoutClick = async () => {
    try {
      await signOut(auth);  // Sign out from Firebase authentication
      setUser(null);  // Set user to null after logout
      localStorage.removeItem("uid");  // Remove uid from local storage
      navigate('/', { replace: true });  // Navigate to home after logout and replace history
    } catch (error) {
      console.error("Error during logout:", error);  // Log error if occurs during logout
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Current user's uid:", currentUser.uid);
        localStorage.setItem("uid", currentUser.uid);  // Store user uid in local storage
      } else {
        console.log("No logged in user!");
        localStorage.removeItem("uid");
        navigate('/', { replace: true });  // Navigate to home if no user and replace history
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);  // Add navigate to dependency array

  // Menu items defined
  const menuItems = [
    { text: '홈', icon: <HomeIcon />, path: '/main' },
    { text: '객체 확인 페이지', icon: <FormatListBulletedIcon />, path: '/obj' },
    { text: '관리페이지', icon: <ControlCameraIcon />, path: '/manage' },
    { text: '고객 문의', icon: <ChatIcon />, path: '/cs' },
  ];


  // Handler to open modal
  const handleModalOpen = () => {
    setModalOpen(true);
  };

  // Handler to close modal
  const handleModalClose = () => setModalOpen(false);

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
        </StyledDrawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default' }}>
          {children}
        </Box>
        {user && <ROSAlarm onNotification={addNotification} />}
        <NotificationModal
          open={modalOpen}
          handleClose={handleModalClose}
          notifications={notifications}
          removeNotification={removeNotification}
          removeAllNotifications={removeAllNotifications}
        />
      </Box>
    </ThemeProvider>
  );
}