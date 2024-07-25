import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../contexts/AuthContext';
import Stack from '@mui/material/Stack';
import {
  Avatar,
  CssBaseline,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Button,
  Typography,
  Container,
  FormHelperText,
} from '@mui/material';
import CustomButton from '../../components/CustomButton';


const LoginPage = React.memo(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("혹시 로그인한 사람 있음?", user);
    setCurrentUser(user);
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    setLoading(true);
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log(email, password);
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then((user) => {
        console.log(user);
        navigate("/main");
      })
      .catch((error) => {
        console.error('Error signing in:', error);
        setError('아이디나 비밀번호가 잘못되었습니다. 다시 시도해주세요.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/main');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}> 
      <h2>SmartFarm</h2>

      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleLogin}>
        <Box
          sx={{
            marginTop: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          noValidate
          autoComplete="off"
        >
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              id="filled-textarea"
              type="email"
              label="E-Mail"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              sx={{
                width: 500,
                maxWidth: '100%',
              }}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="filled-textarea"
              label="Password"
              variant="filled"
              sx={{
                width: 500,
                maxWidth: '100%',
              }}
            />
          </FormControl>
        </Box>
        <Stack dircetion="column" spacing={2}>
          <CustomButton>Sign In</CustomButton>
          <Button onClick={handleGoogleLogin} fullWidth sx={{ mt: 3, mb: 2 }} variant="contained">
            Login With Google
          </Button>
          <Grid item>
            <Link to="/signup" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Stack>
      </form>         
    </div>
    
  );
});

export default LoginPage;
