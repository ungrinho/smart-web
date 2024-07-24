import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = (props) => {
  return (
    <Button
      type="submit"
      fullWidth 
      variant="contained" 
      size='large'
      {...props}
      sx={{
        mt: 3, 
        mb: 2,
        backgroundColor: '#03c75a',
        '&:hover': {
          backgroundColor: '#029b4a',
        },
      }}
    >
      {props.children}
    </Button>
  );
};

export default CustomButton;
