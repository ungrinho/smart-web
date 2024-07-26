import React, { useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button'

const MainContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const CardContainer = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
});

function Manage(){

    const [alignment, setAlignment] = React.useState('auto');
    const [currentImage, setCurrentImage] = React.useState('http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw');
    const [handsOn, setHandsOn] = React.useState(<Card></Card>)

    useEffect(() => {

        setCurrentImage(
            alignment == 'auto' ?
            'http://192.168.137.139:8080/stream?topic=/usb_cam1/image_raw' :
            'http://192.168.137.139:8080/stream?topic=/usb_cam2/image_raw'
        )
    }, [alignment])

    const handleChange = (event, newAlignment) => {
        console.log(newAlignment)
        setAlignment(newAlignment);
    };

    return(
        <MainContainer>
            <ToggleButtonGroup
                color="primary"
                value={alignment}
                exclusive
                onChange={handleChange}
                aria-label="Platform"
                >
                <ToggleButton value="auto" style={{ width: '200px'}}>Auto</ToggleButton>
                <ToggleButton value="control" style={{ width: '200px'}}>Hands-on</ToggleButton>
            </ToggleButtonGroup>
            <br />
            <CardContainer>
                <Card style={{ width: '100%', textAlign:'center'}}>
                    <img src={currentImage}
                        alt='영상'
                        onError={(e) => e.target.src= "/video.png"}
                        style={{ width: '100%', height: '100%'}}/>
                </Card>
                <Card>
                    
                </Card>
            </CardContainer>
        </MainContainer>
    )
}

export default Manage;