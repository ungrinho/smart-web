// import React, { useRef, useState } from 'react';
// import emailjs from '@emailjs/browser';
// import {
//   Container,
//   Typography,
//   TextField,
//   Box,
//   Grid,
//   Snackbar,
//   Alert,
//   Button,
//   FormHelperText,
//   FormControl,
//   FormControlLabel,
//   Checkbox,
// } from '@mui/material';
// import { styled } from '@mui/material/styles';

// const FormHelperTexts = styled(FormHelperText)`
//   width: 100%;
//   padding-left: 16px;
//   font-weight: 700 !important;
//   color: #d32f2f !important;
// `;

// const Boxs = styled(Box)`
//   padding-bottom: 40px !important;
// `;

// export const CS = () => {
//   const form = useRef();
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
//   const [title, setTitle] = useState('');
//   const [message, setMessage] = useState('');
//   const [email, setEmail] = useState('');
//   const [checked, setChecked] = useState(false);
//   const [titleError, setTitleError] = useState('');
//   const [messageError, setMessageError] = useState('');
//   const [emailError, setEmailError] = useState('');
//   const [checkedError, setCheckedError] = useState('');

//   const handleAgree = (event) => {
//     setChecked(event.target.checked);
//     setCheckedError('');
//   };

//   const sendEmail = (e) => {
//     e.preventDefault();
    
//     let isValid = true;

//     if (title.trim() === '') {
//       setTitleError('제목을 입력해주세요.');
//       isValid = false;
//     } else {
//       setTitleError('');
//     }

//     if (message.trim() === '') {
//       setMessageError('문의 내용을 입력해주세요.');
//       isValid = false;
//     } else {
//       setMessageError('');
//     }

//     const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
//     if (!emailRegex.test(email)) {
//       setEmailError('올바른 이메일 형식이 아닙니다.');
//       isValid = false;
//     } else {
//       setEmailError('');
//     }

//     if (!checked) {
//       setCheckedError('개인정보 수집에 동의해주세요.');
//       isValid = false;
//     } else {
//       setCheckedError('');
//     }

//     if (!isValid) {
//       return;
//     }

//     emailjs
//       .sendForm('service_h7d6kfv', 'template_en6qwf9', form.current, 'k8qlCKerGZ-zGuKKZ')
//       .then((result) => {
//         console.log(result.text);
//         setSnackbar({ open: true, message: '문의가 성공적으로 전송되었습니다.', severity: 'success' });
//         form.current.reset();
//         setTitle('');
//         setMessage('');
//         setEmail('');
//         setChecked(false);
//       }, (error) => {
//         console.log(error.text);
//         setSnackbar({ open: true, message: '문의 전송에 실패했습니다. 다시 시도해 주세요.', severity: 'error' });
//       });
//   };

//   const handleCloseSnackbar = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setSnackbar({ ...snackbar, open: false });
//   };

//   return (
//     <Container component="main" maxWidth="sm">
//       <Boxs sx={{ my: 4, pb: 4 }}>
//         <Typography variant="h4" component="h1" align="center" sx={{ mb: 2 }}>
//           문의 페이지
//         </Typography>
//         <FormControl component="fieldset" variant="standard" fullWidth>
//           <form ref={form} onSubmit={sendEmail}>
//             <Grid container spacing={2}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="제목"
//                   name="title"
//                   variant="outlined"
//                   required
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   error={titleError !== ''}
//                 />
//                 <FormHelperTexts>{titleError}</FormHelperTexts>
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="문의 내용"
//                   name="message"
//                   multiline
//                   rows={4}
//                   variant="outlined"
//                   required
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   error={messageError !== ''}
//                 />
//                 <FormHelperTexts>{messageError}</FormHelperTexts>
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="회신받을 이메일"
//                   name="reply_mail"
//                   type="email"
//                   variant="outlined"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   error={emailError !== ''}
//                 />
//                 <FormHelperTexts>{emailError}</FormHelperTexts>
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Checkbox value="allowExtraEmails" color="primary" checked={checked} onChange={handleAgree} />}
//                   label={
//                     <span>
//                       개인정보 수집 동의(필수)<br />
//                       수집하는 개인정보 항목: 이메일 주소<br />
//                       작성해 주시는 개인정보는 문의 접수 및 고객 불만 해결을 위해 3년간 보관됩니다.<br />
//                       이용자는 본 동의를 거부할 수 있으나, 미동의 시 문의 접수가 불가능합니다.
//                     </span>
//                   }
//                 />
//                 <FormHelperTexts>{checkedError}</FormHelperTexts>
//               </Grid>
//               <Grid item xs={12}>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   color="primary"
//                   fullWidth
//                 >
//                   문의하기
//                 </Button>
//               </Grid>
//             </Grid>
//           </form>
//         </FormControl>
//       </Boxs>
//       <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// }

// export default CS;
















import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Snackbar,
  Alert,
  Button,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FormHelperTexts = styled(FormHelperText)`
  width: 100%;
  padding-left: 16px;
  font-weight: 700 !important;
  color: #d32f2f !important;
`;

const Boxs = styled(Box)`
  padding-bottom: 40px !important;
`;

export const CS = () => {
  const form = useRef();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(false);

  const [titleError, setTitleError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [checkedError, setCheckedError] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    
    let isValid = true;

    if (title.trim() === '') {
      setTitleError('제목을 입력해주세요.');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (message.trim() === '') {
      setMessageError('문의 내용을 입력해주세요.');
      isValid = false;
    } else {
      setMessageError('');
    }

    const emailRegex = /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!checked) {
      setCheckedError('약관에 동의해주세요.');
      isValid = false;
    } else {
      setCheckedError('');
    }

    if (!isValid) {
      return;
    }

    emailjs
      .sendForm('service_h7d6kfv', 'template_en6qwf9', form.current, 'k8qlCKerGZ-zGuKKZ')
      .then((result) => {
        console.log(result.text);
        setSnackbar({ open: true, message: '문의가 성공적으로 전송되었습니다.', severity: 'success' });
        form.current.reset();
        setTitle('');
        setMessage('');
        setEmail('');
        setName('');
        setChecked(false);
      }, (error) => {
        console.log(error.text);
        setSnackbar({ open: true, message: '문의 전송에 실패했습니다. 다시 시도해 주세요.', severity: 'error' });
      });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Boxs sx={{ my: 4, pb: 4 }}>
        <Typography variant="h4" component="h1" align="center" sx={{ mb: 2 }}>
          문의 페이지
        </Typography>
        <FormControl component="fieldset" variant="standard" fullWidth>
          <form ref={form} onSubmit={sendEmail}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="제목"
                  name="title"
                  variant="outlined"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  error={titleError !== ''}
                />
                <FormHelperTexts>{titleError}</FormHelperTexts>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="문의 내용"
                  name="message"
                  multiline
                  rows={4}
                  variant="outlined"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  error={messageError !== ''}
                />
                <FormHelperTexts>{messageError}</FormHelperTexts>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="회신받을 이메일"
                  name="reply_mail"
                  type="email"
                  variant="outlined"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError !== ''}
                />
                <FormHelperTexts>{emailError}</FormHelperTexts>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      value="allowExtraEmails" 
                      color="primary" 
                      checked={checked} 
                      onChange={(e) => setChecked(e.target.checked)} 
                    />
                  }
                  label={
                    <span>
                      개인정보 수집 동의(필수)<br />
                      수집하는 개인정보 항목: 이메일 주소<br />
                      작성해 주시는 개인정보는 문의 접수 및 고객 불만 해결을 위해 3년간 보관됩니다.<br />
                      이용자는 본 동의를 거부할 수 있으나, 미동의 시 문의 접수가 불가능합니다.
                    </span>
                  }
                />
                <FormHelperTexts>{checkedError}</FormHelperTexts>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  문의하기
                </Button>
              </Grid>
            </Grid>
          </form>
        </FormControl>
      </Boxs>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CS;
