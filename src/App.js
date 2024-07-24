import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import Main from './pages/service/Main';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Drawer from './components/Drawer';
import Object from './pages/service/Object';

const AppContent = () => {
  const location = useLocation();
  
  // SignIn과 SignUp 페이지에서는 Drawer를 렌더링하지 않음
  const shouldRenderDrawer = !['/signin', '/signup', '/'].includes(location.pathname);

  return (
    <>
      {shouldRenderDrawer ? (
        <Drawer>
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/obj" element={<Object />} />
            {/* 다른 Drawer가 필요한 라우트들 */}
          </Routes>
        </Drawer>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      )}
    </>
  );
};



const App = () => {
  return (

    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>

  );
};

export default App;