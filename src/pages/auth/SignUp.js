import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import styled from 'styled-components';

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 10px;
  width: 300px;
`;

const Button = styled.button`
  margin: 10px 0;
  padding: 10px;
  width: 300px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
`;

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // useHistory 대신 useNavigate 사용

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        console.log(userCredential)
      })
      navigate('/main');  // history.push 대신 navigate 사용
    } catch (error) {
      console.error('회원가입 에러:', error);
    }
  };

  return (
    <SignupContainer>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">회원가입</Button>
      </form>
    </SignupContainer>
  );
}

export default SignUp;