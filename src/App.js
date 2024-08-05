import React, { useState , createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import Main from './pages/service/Main';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Drawer from './components/Drawer';
import Object from './pages/service/Object';
import CS from './pages/service/CS';
import Manage from './pages/service/Manage';

export const topicButtonContext = createContext();

const AppContent = () => {
  const location = useLocation();
  const [ topicButton, setTopicButton ] = useState({ isTopicStart : false });
  // SignIn과 SignUp 페이지에서는 Drawer를 렌더링하지 않음
  const shouldRenderDrawer = !['/signin', '/signup', '/'].includes(location.pathname);

  return (
    <>
    <topicButtonContext.Provider value={{topicButton, setTopicButton}}>
      {shouldRenderDrawer ? (
        <Drawer>
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/obj" element={<Object />} />
            <Route path="/CS" element={<CS />} />
            <Route path="/manage" element={<Manage />} />
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
      </topicButtonContext.Provider>
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