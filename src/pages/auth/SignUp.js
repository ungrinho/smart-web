import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { FormControl, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';


function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        console.log(userCredential)
      })
      navigate('/main'); 
    } catch (error) {
      console.error('회원가입 에러:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
      <Box
          // component="form"
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
        </ FormControl>
      </Box>
        <Stack direction="column" spacing={2}>
          <Button type="submit" fullWidth sx={{ mt: 3, mb: 2 }} variant="contained" size='large'>Sign Up</Button>
          <Grid item>
            <span>You have an account already? </span>
              <Link to="/signin" variant="body2" style={{ textDecoration: 'none', color: 'black' }}>
                <span style={{ textDecoration: 'underline', color: 'blue'}}>Sign In</span>
              </Link>
            </Grid>
        </Stack>
      </form>
    </div>
  );
}

export default SignUp;