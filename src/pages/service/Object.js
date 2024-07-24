import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

const MainContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const CardContainer = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
});

function createData(date, treeNumber, total, detectedObj, images) {
    return {
        date,
        treeNumber,
        total,
        detectedObj,
        images,
    };
}

const ClickTableCell = styled(TableCell)({
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#ccc',
    },
});

function Row(props) {
    const { row, onImageClick } = props;
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.treeNumber}
                </TableCell>
                <TableCell align="right">{row.total}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detected Objects
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableBody>
                                    {row.detectedObj.map((obj, index) => (
                                        <TableRow key={index} onClick={() => onImageClick(row.images[index])}>
                                            <ClickTableCell  component="th" scope="row">
                                                {obj}
                                            </ClickTableCell >
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

Row.propTypes = {
    row: PropTypes.shape({
        treeNumber: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
        detectedObj: PropTypes.arrayOf(PropTypes.string).isRequired,
        images: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    onImageClick: PropTypes.func.isRequired,
};

const allRows = [
    createData('2024-07-24', 'Tree 1', 159, ['Obj A', 'Obj B'], ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']),
    createData('2024-07-24', 'Tree 2', 237, ['Obj C'], ['https://via.placeholder.com/150']),
    createData('2024-07-23', 'Tree 3', 262, ['Obj D', 'Obj E', 'Obj F'], ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150']),
    createData('2024-07-22', 'Tree 4', 305, ['Obj G'], ['https://via.placeholder.com/150']),
];

function Object() {
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [filteredRows, setFilteredRows] = useState([]);

    useEffect(() => {
        const filtered = allRows.filter(row => row.date === selectedDate);
        setFilteredRows(filtered);
    }, [selectedDate]);

    const handleImageClick = (src) => {
        setSelectedImage(src);
    };

    const handleDateChange = (date) => {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
    };

    return (
        <MainContainer>
            <CardContainer>
                <Card style={{ width: '100%', height: '100%', textAlign: 'center' }}>
                    <img src='http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw' alt='영상' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Card>
                <Card style={{ width: '100%', height: '100%', textAlign: 'center'}}>
                    <img src={selectedImage || 'https://png.pngtree.com/element_our/20190528/ourmid/pngtree-load-icon-image_1145253.jpg'} alt="검출된 토마토 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Card>
            </CardContainer>
            <br />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar onChange={handleDateChange} style={{ width: '50%'}}/>
                </LocalizationProvider>
                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Tree Number</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRows.map((row) => (
                                <Row key={row.treeNumber} row={row} onImageClick={handleImageClick} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </MainContainer>
    );
}

export default Object;
