import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ErrorMessage from '../../components/ErrorMessage';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  createTheme,
  ThemeProvider,
  styled,
  FormHelperText,
  FormControl
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CustomButton from '../../components/CustomButton';




const FormHelperTexts = styled(FormHelperText)`
  width: 100%;
  padding-left: 16px;
  font-weight: 700 !important;
  color: #d32f2f !important;
`;

const LoginPage = React.memo(() => {
  // 기본 테마 생성
  const theme = createTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("혹시 로그인한 사람 있음?", user);
  }, [user]);

  const validateEmail = (email) => {
    const regex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    return regex.test(email);
  };

  // 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setPasswordError('');

    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      setLoading(false);
      return;
    }

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, email, password);
      })
      .then(() => {
        navigate("/main");
      })
      .catch((error) => {
        console.error('Error signing in:', error);
        if (error.code === 'auth/wrong-password') {
          setPasswordError('올바른 비밀번호가 아닙니다.');
        } else if (error.code === 'auth/user-not-found') {
          setEmailError('존재하지 않는 이메일입니다.');
        } else {
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Google 로그인 핸들러
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
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // 배경색 및 그림자 추가
            backgroundColor: 'background.paper',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* 로고 아바타 */}
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          
          {/* 페이지 제목 */}
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>
            SmartFarm Login
          </Typography>
          
          {/* 에러 메시지 표시 */}
          {error && <ErrorMessage message={error} />}
          
          {/* 로그인 폼 */}
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 3 }}>
            {/* 이메일 입력 필드 */}
            <FormControl component="fieldset" variant="standard">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!emailError}
                  />
                  {emailError && <FormHelperTexts>{emailError}</FormHelperTexts>}
                </Grid>
                
                {/* 비밀번호 입력 필드 */}
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                  />
                  {passwordError && <FormHelperTexts>{passwordError}</FormHelperTexts>}
                </Grid>
                
                {/* 로그인 버튼 */}
                <Grid item xs={12}>
                  <CustomButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    Sign In
                  </CustomButton>
                </Grid>
                
                {/* Google 로그인 버튼 */}
                <Grid item xs={12}> 
                  <Button
                    onClick={handleGoogleLogin}
                    fullWidth
                    variant="contained"
                    sx={{ mt: 1, mb: 2 }}
                    disabled={loading}
                  >
                    Login With Google
                  </Button>
                </Grid>
                
                {/* 회원가입 링크 */}
                <Grid container justifyContent="center">
                  <Grid item>
                    <span>Don't have an account? </span>
                    <Link to="/signup" variant="body2" style={{ textDecoration: 'underline', color: 'blue' }}>
                      <span>Sign Up</span>
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            </FormControl>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
});
  

export default LoginPage;