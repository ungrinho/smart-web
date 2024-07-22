import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Main from './pages/service/Main';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

import { AuthProvider } from './contexts/AuthContext';

import Sidebar from './components/Drawer';
import MiniDrawer from './components/Drawer';



// const AppContainer = styled.div`
//   display: flex;
// `;

// const AppContent = styled.div`
//   flex: 1;
//   padding: 20px;
// `;

// function App() {
const App = () => {
  return (
    <AuthProvider children={
      <BrowserRouter>
        <MiniDrawer>

          <Routes>
            
            <Route
                path="/" exact
                element={<Navigate to="/services/main" replace />}
            />
            <Route path="/main" element={<Main />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

          </Routes>
        </MiniDrawer>
      </BrowserRouter>} 
    />
    
  );
}

// function App() {
//   return(

//   )
// }

export default App;
