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
// import LineChartComponent from '../../components/LineChartComponent';
import BarChartComponent from '../../components/BarChartComponent';

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
    paddingTop: '60px', // 모바일에서 더 작은 패딩
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

// 얇은 테두리를 가진 TableCell 스타일 정의
const BorderedTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // 마우스 오버 시 배경색 변경
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

// Row 컴포넌트: 각 트리에 대한 데이터를 표시하는 확장 가능한 행
function Row(props) {
    const { row, onImageClick } = props;
    const [open, setOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
  
    const handleCategoryClick = (category) => {
      setSelectedCategory(category === selectedCategory ? null : category);
    };
  
    return (
      <React.Fragment>
        <StyledTableRow>
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
        </StyledTableRow>
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
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell align="right">Count</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(row.categories).map(([category, count]) => (
                      <React.Fragment key={category}>
                        <StyledTableRow onClick={() => handleCategoryClick(category)}>
                          <TableCell component="th" scope="row">
                            {category}
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </StyledTableRow>
                        {selectedCategory === category && (
                          <TableRow>
                            <TableCell colSpan={2} style={{ paddingBottom: 0, paddingTop: 0 }}>
                              <Collapse in={selectedCategory === category} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <BorderedTableCell>Tree Number</BorderedTableCell>
                                        <BorderedTableCell>Ripeness</BorderedTableCell>
                                        <BorderedTableCell>NO.</BorderedTableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {row.images[category.toLowerCase()] && row.images[category.toLowerCase()].map((image, index) => {
                                        const [treeNumber, ripeness, type, count, date] = image.fileName.replace('.jpg', '').split('-');
                                        return (
                                          <StyledTableRow key={index} hover onClick={() => onImageClick(image.fileName)} style={{ cursor: 'pointer' }}>
                                            <BorderedTableCell>{treeNumber}</BorderedTableCell>
                                            <BorderedTableCell>{ripeness}</BorderedTableCell>
                                            <BorderedTableCell>{count}</BorderedTableCell>
                                          </StyledTableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
  

// Object 컴포넌트: 메인 페이지 구성
function Object() {
    // 상태 변수들을 정의합니다.
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [imageMetadata, setImageMetadata] = useState([]); 
    const [weeklyData, setWeeklyData] = useState([]);
    const storage = getStorage();
  
    useEffect(() => {
      const uid = localStorage.getItem('uid');
      console.log('date:', selectedDate, 'uid:', uid);
      const fetchData = async () => {
        try {
          // 실제 API 호출
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
  
    // 이미지 메타데이터를 트리 번호와 카테고리별로 그룹화합니다.
    const groupedMetadata = imageMetadata.reduce((acc, meta) => {
      const [treeNumber, category] = meta.fileName.split('-');
      if (!acc[treeNumber]) {
        acc[treeNumber] = { ripe: [], unripe: [], halfripe: [] };
      }
      if (acc[treeNumber][category.toLowerCase()]) {
        acc[treeNumber][category.toLowerCase()].push(meta);
      } else {
        console.error(`Unknown category: ${category.toLowerCase()}`);
      }
      return acc;
    }, {});
  
    // 그룹화된 메타데이터를 기반으로 행 데이터를 생성합니다.
    const rows = Object.entries(groupedMetadata).map(([treeNumber, categories]) => ({
      date: selectedDate,
      treeNumber: `Tree ${treeNumber}`,
      total: categories.ripe.length + categories.unripe.length + categories.halfripe.length,
      categories: {
        'Ripe': categories.ripe.length,
        'Unripe': categories.unripe.length,
        'HalfRipe': categories.halfripe.length
      },
      images: categories
    }));
  
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
    return (
      <MainContainer>
        <CardContainer>
          <Card style={{ width: '100%', height: isSmallScreen ? 'auto' : '100%', textAlign: 'center' }}>
            <BarChartComponent />
          </Card>
          {/* 선택된 이미지를 표시하는 카드 */}
          <Card style={{ width: '100%', height: isSmallScreen ? 'auto' : '370px', textAlign: 'center'}}>
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
          {/* 날짜 선택 캘린더 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar 
              onChange={handleDateChange} 
              style={{ width: isSmallScreen ? '100%' : '50%'}}
            />
          </LocalizationProvider>
          {/* 데이터 테이블 */}
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
                {/* 각 트리에 대한 Row 컴포넌트를 렌더링 */}
                {rows.map((row) => (
                  <Row key={row.treeNumber} row={row} onImageClick={handleImageClick} /> 
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </MainContainer>
    );
  }
  
  export default Object;
  