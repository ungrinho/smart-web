import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import {
  Avatar,
  CssBaseline,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  FormHelperText,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import CustomButton from '../../components/CustomButton';



const FormHelperTexts = styled(FormHelperText)`
  width: 100%;
  padding-left: 16px;
  font-weight: 700 !important;
  color: #d32f2f !important;
`;

const Boxs = styled(Box)`
  padding-bottom: 40px !important;
`;

const SignUp = () => {
  const theme = createTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleAgree = (event) => {
    setChecked(event.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    // const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/; // 비밀번호 조합 조건까지
    const nameRegex = /^[가-힣a-zA-Z]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    } else {
      setEmailError('');
    }

    // // 비밀번호 조합 조건까지
    // if (!passwordRegex.test(password)) {
    //   setPasswordError('숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요!');
    //   return;
    // } else if (password !== rePassword) {
    //   setPasswordError('비밀번호가 일치하지 않습니다.');
    //   return;
    // } else {
    //   setPasswordError('');
    // }

    if (password !== rePassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    } else {
      setPasswordError('');
    }

    if (!nameRegex.test(name) || name.length < 1) {
      setNameError('올바른 이름을 입력해주세요.');
      return;
    } else {
      setNameError('');
    }

    if (!checked) {
      alert('회원가입 약관에 동의해주세요.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/main');
    } catch (error) {
      console.error('회원가입 에러:', error);
      setRegisterError('회원가입에 실패하였습니다. 다시 한 번 확인해 주세요.');
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
          }}
        >

          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }} />
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Boxs component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <FormControl component="fieldset" variant="standard">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError !== ''}
                  />
                  <FormHelperTexts>{emailError}</FormHelperTexts>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError !== ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="rePassword"
                    label="rePassword"
                    type="password"
                    id="rePassword"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    error={passwordError !== ''}
                  />
                  <FormHelperTexts>{passwordError}</FormHelperTexts>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={nameError !== ''}
                  />
                  <FormHelperTexts>{nameError}</FormHelperTexts>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox value="allowExtraEmails" color="primary" checked={checked} onChange={handleAgree} />}
                    label="Agree With These Terms."
                  />
                </Grid>
              </Grid>
              <CustomButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </CustomButton>
              <Grid container justifyContent="center">
                <Grid item>
                  <span>You have an account already? </span>
                  <Link to="/signin" variant="body2" style={{ textDecoration: 'underline', color: 'blue' }}>
                    <span>Sign In</span>
                  </Link>
                </Grid>
              </Grid>
            </FormControl>
            <FormHelperTexts>{registerError}</FormHelperTexts>
          </Boxs>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SignUp;