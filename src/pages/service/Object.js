// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios'; 
// import { Link, useNavigate } from 'react-router-dom';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/Typography';
// import { styled } from '@mui/material/styles';
// import PropTypes from 'prop-types';
// import Box from '@mui/material/Box';
// import Collapse from '@mui/material/Collapse';
// import IconButton from '@mui/material/IconButton';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';
// import Paper from '@mui/material/Paper';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
// import dayjs from 'dayjs';

// const MainContainer = styled('div')({
//     display: 'flex',
//     flexDirection: 'column',
// });

// const CardContainer = styled('div')({
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//     gap: '20px',
// });

// function createData(date, treeNumber, total, detectedObj, images) {
//     return {
//         date,
//         treeNumber,
//         total,
//         detectedObj,
//         images,
//     };
// }

// const ClickTableCell = styled(TableCell)({
//     cursor: 'pointer',
//     '&:hover': {
//         backgroundColor: '#ccc',
//     },
// });

// function Row(props) {
//     const { row, onImageClick } = props;
//     const [open, setOpen] = React.useState(false);

//     return (
//         <React.Fragment>
//             <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
//                 <TableCell>
//                     <IconButton
//                         aria-label="expand row"
//                         size="small"
//                         onClick={() => setOpen(!open)}
//                     >
//                         {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//                     </IconButton>
//                 </TableCell>
//                 <TableCell component="th" scope="row">
//                     {row.treeNumber}
//                 </TableCell>
//                 <TableCell align="right">{row.total}</TableCell>
//             </TableRow>
//             <TableRow>
//                 <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
//                     <Collapse in={open} timeout="auto" unmountOnExit>
//                         <Box sx={{ margin: 1 }}>
//                             <Typography variant="h6" gutterBottom component="div">
//                                 Detected Objects
//                             </Typography>
//                             <Table size="small" aria-label="purchases">
//                                 <TableBody>
//                                     {row.detectedObj.map((obj, index) => (
//                                         <TableRow key={index} onClick={() => onImageClick(row.images[index])}>
//                                             <ClickTableCell  component="th" scope="row">
//                                                 {obj}
//                                             </ClickTableCell >
//                                         </TableRow>
//                                     ))}
//                                 </TableBody>
//                             </Table>
//                         </Box>
//                     </Collapse>
//                 </TableCell>
//             </TableRow>
//         </React.Fragment>
//     );
// }

// Row.propTypes = {
//     row: PropTypes.shape({
//         treeNumber: PropTypes.string.isRequired,
//         total: PropTypes.number.isRequired,
//         detectedObj: PropTypes.arrayOf(PropTypes.string).isRequired,
//         images: PropTypes.arrayOf(PropTypes.string).isRequired,
//     }).isRequired,
//     onImageClick: PropTypes.func.isRequired,
// };

// const allRows = [
//     createData('2024-07-24', 'Tree 1', 159, ['Obj A', 'Obj B'], ['https://via.placeholder.com/150', 'https://via.placeholder.com/150']),
//     createData('2024-07-24', 'Tree 2', 237, ['Obj C'], ['https://via.placeholder.com/150']),
//     createData('2024-07-23', 'Tree 3', 262, ['Obj D', 'Obj E', 'Obj F'], ['https://via.placeholder.com/150', 'https://via.placeholder.com/150', 'https://via.placeholder.com/150']),
//     createData('2024-07-22', 'Tree 4', 305, ['Obj G'], ['https://via.placeholder.com/150']),
// ];

// function Object() {
//     const [selectedImage, setSelectedImage] = useState('');
//     const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
//     const [filteredRows, setFilteredRows] = useState([]);

//     useEffect(() => {
//         const filtered = allRows.filter(row => row.date === selectedDate);
//         setFilteredRows(filtered);
//     }, [selectedDate]);

//     const handleImageClick = (src) => {
//         setSelectedImage(src);
//     };

//     const handleDateChange = (date) => {
//         setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
//     };

//     return (
//         <MainContainer>
//             <CardContainer>
//                 <Card style={{ width: '100%', height: '100%', textAlign: 'center' }}>
//                     <img src='http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw' alt='영상' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 </Card>
//                 <Card style={{ width: '100%', height: '100%', textAlign: 'center'}}>
//                     <img src={selectedImage || 'https://png.pngtree.com/element_our/20190528/ourmid/pngtree-load-icon-image_1145253.jpg'} alt="검출된 토마토 사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                 </Card>
//             </CardContainer>
//             <br />
//             <div style={{ display: 'flex', flexDirection: 'row' }}>
//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                     <DateCalendar onChange={handleDateChange} style={{ width: '50%'}}/>
//                 </LocalizationProvider>
//                 <TableContainer component={Paper}>
//                     <Table aria-label="collapsible table">
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell />
//                                 <TableCell>Tree Number</TableCell>
//                                 <TableCell align="right">Total</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {filteredRows.map((row) => (
//                                 <Row key={row.treeNumber} row={row} onImageClick={handleImageClick} />
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </div>
//         </MainContainer>
//     );
// }

// export default Object;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
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
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Object.entries 폴리필
if (!Object.entries) {
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i);
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
  };
}

const MainContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const CardContainer = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
});

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
                                            <ClickTableCell component="th" scope="row">
                                                {obj}
                                            </ClickTableCell>
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

function Object() {
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [imageMetadata, setImageMetadata] = useState([]);
    const storage = getStorage();

    useEffect(() => {
        const uid = localStorage.getItem('uid');
        console.log('date:', selectedDate, 'uid:', uid);
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/images/metadata', {
                    params: {
                        date: selectedDate,
                        uid: uid
                    }
                });
                console.log('API Response:', response.data);
                if (Array.isArray(response.data)) {
                    setImageMetadata(response.data);
                } else {
                    console.error('Expected array, got:', typeof response.data);
                    setImageMetadata([]);
                }
            } catch (error) {
                console.error('Error fetching image metadata:', error);
                setImageMetadata([]);
            }
        };
        fetchData();
    }, [selectedDate]);

    const handleImageClick = async (fileName) => {
        try {
            const url = await getDownloadURL(ref(storage, fileName));
            setSelectedImage(url);
        } catch (error) {
            console.error('Error getting download URL:', error);
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
    };

    // imageMetadata가 배열인지 확인
    const groupedMetadata = Array.isArray(imageMetadata) ? imageMetadata.reduce((acc, meta) => {
        const [treeNumber] = meta.fileName.split('-');
        if (!acc[treeNumber]) {
            acc[treeNumber] = [];
        }
        acc[treeNumber].push(meta);
        return acc;
    }, {}) : {};

    console.log('groupedMetadata:', groupedMetadata);
    console.log('groupedMetadata type:', typeof groupedMetadata);
    console.log('Object.entries exists:', typeof Object.entries === 'function');

    // for...in 루프를 사용한 rows 생성
    const rows = [];
    for (let treeNumber in groupedMetadata) {
        if (groupedMetadata.hasOwnProperty(treeNumber)) {
            const metas = groupedMetadata[treeNumber];
            rows.push({
                date: selectedDate,
                treeNumber: `Tree ${treeNumber}`,
                total: metas.length,
                detectedObj: metas.map(meta => meta.fileName.split('-')[1]),
                images: metas.map(meta => meta.fileName)
            });
        }
    }

    return (
        <MainContainer>
            <CardContainer>
                <Card style={{ width: '100%', height: '98%', textAlign: 'center' }}>
                    <img src='http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw'
                         alt='영상'
                         onError={(e) => e.target.src = "/video.png"}
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Card>
                <Card style={{ width: '100%', height: '98%', textAlign: 'center'}}>
                    <img src={selectedImage || '/camera.png'}
                    alt="검출된 토마토 사진"
                    style={{ width: '100%', height: '100e%', objectFit: 'cover' }} />
                </Card>
            </CardContainer>
            <br />
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar onChange={handleDateChange} style={{ width: '50%'}}/>
                </LocalizationProvider>
                <TableContainer component={Paper} style={{ height: '100%'}}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Tree Number</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
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
