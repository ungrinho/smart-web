import React from 'react';
import { Modal, Box, Typography, Alert, AlertTitle, IconButton, Stack, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

// 모달 스타일 정의 (구글 스타일 참고)
const style = {
  position: 'absolute',       // 모달을 절대 위치로 설정
  top: '57px',                // 구글 모달의 상단 위치
  right: '12px',              // 구글 모달의 오른쪽 위치
  width: 'calc(100% - 24px)', // 화면 너비에서 양쪽 마진을 뺀 값
  maxWidth: '400px',          // 최대 너비 설정
  maxHeight: '80vh',          // 최대 높이 설정
  zIndex: 991,                // 구글 모달의 z-index
  bgcolor: 'background.paper', // 배경색 설정
  boxShadow: 24,              // 그림자 효과
  p: 2,                       // 패딩 설정
  borderRadius: '8px',        // 테두리 둥글게 설정
  transition: 'all 0.1s ease-out', // 애니메이션 효과 추가
  opacity: 0,                 // 초기 투명도 설정
  visibility: 'hidden',       // 초기 감춤 설정
  overflowY: 'auto',          // 스크롤 가능하도록 설정
};

// 모달이 열릴 때 스타일을 변경하는 함수
const getOpenStyle = (isOpen) => ({
  ...style,
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
});

// 알림 모달 컴포넌트
const NotificationModal = ({ open, handleClose, notifications, removeNotification, removeAllNotifications }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={getOpenStyle(open)}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            알림
          </Typography>
          <Button onClick={removeAllNotifications} size="small">
            모든 알림 삭제
          </Button>
        </Box>
        <TransitionGroup component={Stack} spacing={2}>
          {notifications.map((notification) => (
            <CSSTransition key={notification.id} timeout={500} classNames="item">
              <Alert 
                severity={notification.severity} 
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <AlertTitle>{notification.title}</AlertTitle>
                {notification.message}
                <Typography variant="caption" display="block" gutterBottom>
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Alert>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </Box>
    </Modal>
  );
};

export default NotificationModal;