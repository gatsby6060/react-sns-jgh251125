import React, { useEffect, useState } from 'react';
import {
  Grid2,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider, // 추가: 구분선
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home'; // 추가: 아이콘
import SearchIcon from '@mui/icons-material/Search'; // 추가: 아이콘
import ExploreIcon from '@mui/icons-material/Explore'; // 추가: 아이콘
import SendIcon from '@mui/icons-material/Send'; // 추가: 아이콘
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // 추가: 아이콘
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'; // 추가: 아이콘
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'; // 추가: 아이콘

import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';


// 아이콘을 사용하기 위해 import를 추가하고,
// ModeCommentOutlinedIcon이 없다면 임시로 주석 처리하거나 설치가 필요합니다.
// 설치: npm install @mui/icons-material
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';

// **********************************************
// * 컴포넌트 시작: InstaHome
// **********************************************

function InstaHome() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  let [feeds, setFeeds] = useState([]);
  let navigate = useNavigate();

  // 기존 fnGetFeed, handleClickOpen, handleClose, handleAddComment, fndelete 함수는
  // 코드량상 생략되었으나, 원본 코드에서 그대로 사용하시면 됩니다.

  // 편의상 fnGetFeed 함수를 여기에 다시 포함합니다.
  function fnGetFeed() {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("decode==> ", decoded);
      // fetch("http://localhost:3010/instahome/" + decoded.userId)
      fetch("http://localhost:3010/instahome" )
        .then(res => res.json())
        .then(data => {
          console.log("인스타피드, 돌아온데이터 JOSN변환 " + JSON.stringify(data));
          setFeeds(data.list);
        })
    } else {
      alert("로그인 해주세요");
      navigate("/");
    }
  }

  useEffect(() => {
    fnGetFeed()
  }, []);

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    // 실제 API 호출로 댓글을 가져와야 하지만, 예시를 위해 샘플 댓글 사용
    setComments([
        { id: 'user1', text: '멋진 사진이에요!', avatarUrl: '/static/images/avatar/1.jpg' },
        { id: 'user2', text: '이 장소에 가보고 싶네요!', avatarUrl: '/static/images/avatar/2.jpg' },
    ]); 
    setNewComment('');
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // 실제로는 사용자 정보를 가져와야 함.
      const userId = 'currentUser'; 
      setComments([...comments, { id: userId, text: newComment, avatarUrl: '' }]); 
      setNewComment('');
    }
  };

  const fndelete = () => {
    // 삭제 로직 (원래 코드에서 가져옴)
    if (!selectedFeed) return;
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3010/feed/" + selectedFeed.id, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token") 
        }
      })
        .then(res => res.json())
        .then(data => {
          alert("삭제되었습니다.");
          setOpen(false);
          fnGetFeed();
        })
    } else {
      alert("로그인 해주세요");
      navigate("/");
    }
  };
  
  // 왼쪽 메뉴 데이터
  const sideBarItems = [
    { text: '홈', icon: <HomeIcon /> },
    { text: '검색', icon: <SearchIcon /> },
    { text: '탐색 탭', icon: <ExploreIcon /> },
    { text: '릴스', icon: <i className="fa-brands fa-instagram-square"></i> }, // 폰트 어썸 사용 예시
    { text: '메시지', icon: <SendIcon /> },
    { text: '알림', icon: <FavoriteBorderIcon /> },
    { text: '만들기', icon: <AddBoxOutlinedIcon /> },
    { text: '프로필', icon: <PersonOutlineIcon /> },
  ];

  // 오른쪽 추천 계정 데이터 (샘플)
  const recommendations = [
    { id: 'realigh', name: '선경원' },
    { id: 'h_y_oung', name: '회원님을 위한 추천' },
    { id: 'mutual_park', name: '회원님을 위한 추천' },
    { id: '99roomy', name: '회원님을 위한 추천' },
  ];

  // **********************************************
  // * 렌더링 시작
  // **********************************************
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      
      {/* 1. 왼쪽 사이드바 */}
      {/* <Box
        sx={{
          width: '240px', // 인스타그램과 유사한 너비
          borderRight: '1px solid #dbdbdb',
          position: 'fixed',
          height: '100%',
          padding: 2,
          backgroundColor: 'white',
        }}
      > */}
        {/* <Typography variant="h5" sx={{ my: 3, fontWeight: 'bold' }}>
          Instagram
        </Typography> */}
        {/* <List>
          {sideBarItems.map((item) => (
            <ListItem button key={item.text} sx={{ borderRadius: '8px' }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ ml: -1 }} />
            </ListItem>
          ))}
        </List> */}
        {/* 더보기 등의 하단 메뉴는 생략 */}
      {/* </Box> */}

      {/* 2. 중앙 & 오른쪽 콘텐츠 (사이드바 너비만큼 왼쪽 여백을 줍니다) */}
      <Box sx={{ flexGrow: 1, ml: '0px', pt: 4, px: 2 }}> {/* ml: '240px'로 왼쪽 공간 확보 취소하고 0px로 함 */}
        <Grid2 container spacing={3} justifyContent="center">

          {/* 2-A. 중앙 메인 피드 영역 */}
          <Grid2 xs={12} md={7}>
            {/* 상단 스토리 바 (샘플 데이터 추가) */}
            <Box sx={{ 
                display: 'flex', 
                overflowX: 'auto', 
                mb: 4, 
                py: 2, 
                border: '1px solid #dbdbdb', 
                backgroundColor: 'white', 
                borderRadius: '5px' 
            }}>
                {['내 스토리', 'userA', 'userB', 'userC', 'userD', 'userE', 'userF'].map((user, index) => (
                    <Box key={index} sx={{ textAlign: 'center', mx: 1 }}>
                        <Avatar 
                            sx={{ 
                                width: 56, 
                                height: 56, 
                                border: '2px solid pink', // 스토리 하이라이트 효과
                                p: '2px'
                            }} 
                        />
                        <Typography variant="caption" noWrap>{user}</Typography>
                    </Box>
                ))}
            </Box>

            {/* 메인 피드 목록 (기존 Card를 피드 스타일로 변경) */}
            {feeds.length > 0 ? (
                feeds.map((feed) => (
                    <Card key={feed.id} sx={{ mb: 4, border: '1px solid #dbdbdb', boxShadow: 'none' }}>
                        {/* 피드 헤더 */}
                        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 32, height: 32, mr: 1 }} />
                            <Typography variant="subtitle2" fontWeight="bold">{feed.userId}</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton size="small">...</IconButton>
                        </Box>

                        {/* 피드 이미지 */}
                        <CardMedia
                            component="img"
                            image={feed.imgPath}
                            alt={feed.imgName}
                            onClick={() => handleClickOpen(feed)}
                            sx={{ cursor: 'pointer', maxHeight: '600px', objectFit: 'cover' }}
                        />

                        {/* 액션 버튼 (좋아요, 댓글 등) */}
                        <Box sx={{ p: 1 }}>
                            <IconButton><FavoriteBorderIcon /></IconButton>
                            <IconButton><ModeCommentOutlinedIcon /></IconButton> {/* ModeCommentOutlinedIcon 필요 */}
                            <IconButton><SendIcon /></IconButton>
                        </Box>
                        
                        {/* 좋아요 수 및 내용 */}
                        <CardContent sx={{ pt: 0 }}>
                             <Typography variant="subtitle2" fontWeight="bold">좋아요 1,234개</Typography>
                            <Typography variant="body2" sx={{ my: 0.5 }}>
                                <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{feed.userId}</Typography>
                                {feed.content}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" onClick={() => handleClickOpen(feed)} sx={{ cursor: 'pointer' }}>
                                댓글 보기... (샘플)
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
              <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h6" color="textSecondary">등록된 피드가 없습니다. 피드를 등록해주세요!</Typography>
              </Box>
            )}
          </Grid2>

          {/* 2-B. 오른쪽 추천 영역 (화면이 작을 때는 숨김) */}
          <Grid2 md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box position="fixed" width={{ md: 300 }}>
              {/* 내 프로필 요약 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2 }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">currentUser</Typography>
                    <Typography variant="body2" color="textSecondary">내 이름</Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="text" size="small" sx={{ fontWeight: 'bold' }}>전환</Button>
              </Box>
              
              {/* 추천 섹션 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">회원님을 위한 추천</Typography>
                <Button variant="text" size="small" sx={{ fontWeight: 'bold' }}>모두 보기</Button>
              </Box>

              <List disablePadding>
                {recommendations.map((rec) => (
                  <ListItem key={rec.id} disableGutters sx={{ py: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36 }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight="bold">{rec.id}</Typography>}
                      secondary={<Typography variant="body2" color="textSecondary">{rec.name}</Typography>}
                    />
                    <Button variant="text" size="small" sx={{ color: '#0095f6', fontWeight: 'bold' }}>
                      팔로우
                    </Button>
                  </ListItem>
                ))}
              </List>
              
              {/* 하단 정보 링크 */}
              <Box sx={{ mt: 3, fontSize: '12px', color: 'text.secondary' }}>
                <Typography variant="caption" color="textSecondary">
                    소개 · 도움말 · 홍보 센터 · API · 채용 정보 · 개인정보처리방침 · 약관 · 위치 · 언어
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                    &copy; 2025 INSTAGRAM FROM META
                </Typography>
              </Box>
            </Box>
          </Grid2>

        </Grid2>
      </Box>

      {/* 피드 상세 모달 (기존 코드 그대로 사용) */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        {/* 모달 내용 (기존 코드에서 크게 변경 없음) */}
        <DialogTitle>
          {selectedFeed?.title || selectedFeed?.userId}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', p: 0 }}>
          {/* 이미지 영역 */}
          <Box sx={{ flex: 1, maxHeight: '600px', overflow: 'hidden' }}>
            {selectedFeed?.imgPath && (
              <img
                src={selectedFeed.imgPath}
                alt={selectedFeed.imgName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} // 이미지 조정
              />
            )}
          </Box>

          {/* 댓글 영역 */}
          <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #dbdbdb' }}>
            <Box sx={{ p: 2, flexShrink: 0 }}>
                 <Typography variant="body2" sx={{ my: 0.5 }}>
                    <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{selectedFeed?.userId}</Typography>
                    {selectedFeed?.content}
                </Typography>
                <Divider sx={{ my: 1 }} />
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}> {/* 댓글 스크롤 */}
              {comments.map((comment, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0, py: 0.5 }}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                        <>
                            <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{comment.id}</Typography>
                            {comment.text}
                        </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ p: 2, borderTop: '1px solid #dbdbdb', flexShrink: 0 }}>
                <TextField
                  label="댓글을 입력하세요"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddComment();
                  }}
                />
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleAddComment}
                  sx={{ marginTop: 1, float: 'right', fontWeight: 'bold' }}
                >
                  게시
                </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #dbdbdb' }}>
          <Button onClick={fndelete} variant='contained' color="primary">
            삭제
          </Button>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}




export default InstaHome;