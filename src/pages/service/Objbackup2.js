import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled, useTheme } from '@mui/material/styles';
import { Card, useMediaQuery, Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Object.keys 폴리필
if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        keys.push(prop);
      }
    }
    return keys;
  };
}

// 기존의 Object.entries 폴리필
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

// 반응형 스타일 적용
const MainContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  padding: '100px 20px 20px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const CardContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
}));

const ClickTableCell = styled(TableCell)({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#ccc',
  },
});

function Row(props) {
    const { row, onImageClick, storage } = props;
    const [open, setOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [selectedImage, setSelectedImage] = React.useState(null);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category === selectedCategory ? null : category);
    };

    const handleImageClick = async (fileName) => {
        try {
            const url = await getDownloadURL(ref(storage, fileName));
            setSelectedImage(url);
            onImageClick(url);
        } catch (error) {
            console.error('Error getting download URL:', error);
            setSelectedImage(null);
        }
    };

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
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(row.categories).map(([category, count]) => (
                                        <React.Fragment key={category}>
                                            <TableRow onClick={() => handleCategoryClick(category)}>
                                                <ClickTableCell component="th" scope="row">
                                                    {category}
                                                </ClickTableCell>
                                                <TableCell align="right">{count}</TableCell>
                                            </TableRow>
                                            {selectedCategory === category && (
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        <List>
                                                            {row.images[category.toLowerCase()].map((image, index) => (
                                                                <ListItem key={index} button onClick={() => handleImageClick(image.fileName)}>
                                                                    <ListItemText primary={image.fileName} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                            {selectedImage && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <img 
                                        src={selectedImage}
                                        alt="검출된 토마토 사진"
                                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                    />
                                </Box>
                            )}
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

    // 테스트 데이터
    const testData = [
        { fileName: '1-ripe-tomato1.jpg', date: '2023-06-01' },
        { fileName: '1-unripe-tomato1.jpg', date: '2023-06-01' },
        { fileName: '1-green-tomato1.jpg', date: '2023-06-01' },
        { fileName: '2-ripe-tomato2.jpg', date: '2023-06-01' },
        { fileName: '2-unripe-tomato2.jpg', date: '2023-06-01' },
        { fileName: '3-green-tomato3.jpg', date: '2023-06-01' },
        { fileName: '1-ripe-tomato4.jpg', date: '2023-06-02' },
        { fileName: '2-unripe-tomato5.jpg', date: '2023-06-02' },
        { fileName: '3-green-tomato6.jpg', date: '2023-06-02' },
    ];

    // 테스트용 이미지 URL 생성 함수
    const getTestImageUrl = (fileName) => {
        if (fileName.includes('ripe')) {
            return '/ripe-tomato.jpg';
        } else if (fileName.includes('unripe')) {
            return '/unripe-tomato.jpg';
        } else if (fileName.includes('green')) {
            return '/green-tomato.jpg';
        } else {
            return '/camera.png';
        }
    };

    useEffect(() => {
        console.log('date:', selectedDate);
        const filteredData = testData.filter(item => item.date === selectedDate);
        setImageMetadata(filteredData);
        console.log('Filtered Data:', filteredData);
    }, [selectedDate]);

    const handleImageClick = (fileName) => {
        const imageUrl = getTestImageUrl(fileName);
        setSelectedImage(imageUrl);
        console.log('Selected image:', fileName, 'URL:', imageUrl);
    };

    const handleDateChange = (date) => {
        setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
    };

    // imageMetadata가 배열인지 확인
    const groupedMetadata = Array.isArray(imageMetadata) ? imageMetadata.reduce((acc, meta) => {
        const [treeNumber, category] = meta.fileName.split('-');
        if (!acc[treeNumber]) {
            acc[treeNumber] = { ripe: [], unripe: [], green: [] };
        }
        acc[treeNumber][category].push(meta);
        return acc;
    }, {}) : {};

    const rows = (() => {
        const result = [];
        for (const treeNumber in groupedMetadata) {
            const categories = groupedMetadata[treeNumber];
            result.push({
                date: selectedDate,
                treeNumber: `Tree ${treeNumber}`,
                total: categories.ripe.length + categories.unripe.length + categories.green.length,
                categories: {
                    'Ripe': categories.ripe.length,
                    'Unripe': categories.unripe.length,
                    'Green': categories.green.length
                },
                images: categories
            });
        }
        return result;
    })();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <MainContainer>
            <CardContainer>
                <Card style={{ width: '100%', height: isSmallScreen ? 'auto' : '98%', textAlign: 'center' }}>
                    <img 
                        src='http://192.168.0.13:8080/stream?topic=/usb_cam1/image_raw'
                        alt='영상'
                        onError={(e) => e.target.src = "/video.png"}
                        style={{ width: '100%', height: isSmallScreen ? 'auto' : '100%', objectFit: 'cover' }}
                    />
                </Card>
                <Card style={{ width: '100%', height: isSmallScreen ? 'auto' : '98%', textAlign: 'center'}}>
                    <img 
                        src={selectedImage || '/camera.png'}
                        alt="검출된 토마토 사진"
                        style={{ width: '100%', height: isSmallScreen ? 'auto' : '100%', objectFit: 'contain' }}
                    />
                </Card>
            </CardContainer>
            <br />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isSmallScreen ? 'column' : 'row',
                gap: theme.spacing(2)
            }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar 
                        onChange={handleDateChange} 
                        style={{ width: isSmallScreen ? '100%' : '50%'}}
                    />
                </LocalizationProvider>
                <TableContainer component={Paper} style={{ height: isSmallScreen ? 'auto' : '100%', width: isSmallScreen ? '100%' : '50%' }}>
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
                                <Row key={row.treeNumber} row={row} onImageClick={handleImageClick} storage={storage} />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </MainContainer>
    );
}

export default Object;