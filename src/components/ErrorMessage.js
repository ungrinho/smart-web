import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
`;

function ErrorMessage({ message }) {
  return <ErrorContainer>{message}</ErrorContainer>;
}

export default ErrorMessage;