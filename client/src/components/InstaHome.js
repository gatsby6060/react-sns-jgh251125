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

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Stack } from '@mui/material';



// **********************************************
// * 컴포넌트 시작: InstaHome
// **********************************************

function InstaHome() {
  //상세이미지에서 여러 사진을 더 보여주려고 추가
  const [images, setImages] = useState([]);       // 상세창에서 보여줄 이미지 배열
  const [currentImgIdx, setCurrentImgIdx] = useState(0); // 모달 내 현재 이미지 인덱스
  const [imgLoading, setImgLoading] = useState(false);

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
      // alert("InstaHome.js파일 진입");
      fetch("http://localhost:3010/instahome")
        .then(res => res.json())
        .then(data => {
          alert("인스타피드, 돌아온데이터 JOSN변환 " + JSON.stringify(data));
          console.log("인스타피드, 돌아온데이터 JOSN변환 " + JSON.stringify(data));
          setFeeds(data.list);
        })
    } else {
      alert("로그인 해주세요");
      navigate("/instalogin");
    }
  }

  useEffect(() => {
    fnGetFeed()
  }, []);

  const handleClickOpen = async (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    // 실제 API 호출로 댓글을 가져와야 하지만, 예시를 위해 샘플 댓글 사용
    setComments([
      { id: 'user1', text: '멋진 사진이에요!', avatarUrl: '/static/images/avatar/1.jpg' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!', avatarUrl: '/static/images/avatar/2.jpg' },
    ]);
    setNewComment('');

    // 이미지 로드
    setImgLoading(true);
    setImages([]);
    setCurrentImgIdx(0);
    try {
      // 1. 추가 이미지/동영상 목록을 백엔드에서 가져옵니다.
      const resp = await fetch(`http://localhost:3010/instahome/${feed.FEED_ID}/images`);
      if (!resp.ok) throw new Error('이미지 조회 실패');
      const data = await resp.json();
      let fetchedImages = Array.isArray(data.images) ? data.images : [];

      // 2. (핵심 수정) selectedFeed의 첫 번째 미디어를 배열의 맨 앞에 추가합니다.
      const primaryMedia = {
        // 백엔드에서 받은 첫 번째 미디어의 키를 사용합니다.
        imgNo: -1, // 임시로 고유하지 않은 번호를 사용합니다.
        ImgPath: feed.ImgPath,
        mediaType: feed.mediaType,
        imgName: feed.imgName || 'primary-media',
      };

      // 대표 미디어 + 추가 미디어 목록
      const combinedImages = [primaryMedia, ...fetchedImages];

      // 3. images 상태를 업데이트합니다.
      setImages(combinedImages);

    } catch (err) {
      console.error(err);
      // 실패하더라도 대표 미디어만이라도 표시하기 위해
      if (selectedFeed?.ImgPath) {
        setImages([{ 
          imgNo: -1, 
          ImgPath: selectedFeed.ImgPath, 
          mediaType: selectedFeed.mediaType,
          imgName: selectedFeed.imgName || 'primary-media' 
        }]);
      } else {
        setImages([]);
      }
    } finally {
      setImgLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
    setImages([]);
    setCurrentImgIdx(0);
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
  // const sideBarItems = [
  //   { text: '홈', icon: <HomeIcon /> },
  //   { text: '검색', icon: <SearchIcon /> },
  //   { text: '탐색 탭', icon: <ExploreIcon /> },
  //   { text: '릴스', icon: <i className="fa-brands fa-instagram-square"></i> }, // 폰트 어썸 사용 예시
  //   { text: '메시지', icon: <SendIcon /> },
  //   { text: '알림', icon: <FavoriteBorderIcon /> },
  //   { text: '만들기', icon: <AddBoxOutlinedIcon /> },
  //   { text: '프로필', icon: <PersonOutlineIcon /> },
  // ];

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
      <Box sx={{ flexGrow: 0, ml: '50px', pt: 4, px: 2 }}> {/* ml: '240px'로 왼쪽 공간 확보 취소하고 50px로 함 */}
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
                  {/* ... 피드 헤더 생략 ... */}
                  {/* 피드 헤더 */}
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{feed.userId}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small">...</IconButton>
                  </Box>

                  {/* ⭐ 피드 미디어 영역 수정: CardMedia 대신 컴포넌트 분기 */}
                  <Box
                    onClick={() => handleClickOpen(feed)}
                    sx={{ cursor: 'pointer', maxHeight: '600px', objectFit: 'cover' }}
                  >
                    {/* feed.mediaType이 'video'면 <video> 태그, 아니면 <img> 태그 사용 */}
                    {/* feed 객체에는 첫 번째 미디어의 정보(ImgPath, mediaType)가 포함되어 있다고 가정합니다. */}
                    {feed.mediaType === 'video' ? (
                      <video
                        src={feed.ImgPath} // 서버에서 전달받은 경로
                        controls // 재생 컨트롤 표시
                        muted // 자동 재생 시 음소거 (선택 사항)
                        // autoPlay // 자동 재생 (선택 사항)
                        loop // 반복 재생 (선택 사항)
                        style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }}
                      >
                        지원하지 않는 동영상 형식입니다.
                      </video>
                    ) : (
                      <CardMedia // 기존 이미지 컴포넌트 (feed.mediaType이 'image'이거나 없을 때)
                        component="img"
                        image={feed.ImgPath}
                        alt={feed.imgName}
                        sx={{ maxHeight: '600px', objectFit: 'cover' }}
                      />
                    )}
                  </Box>

                  {/* ... 액션 버튼 및 좋아요 수, 내용 생략 ... */}
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
          {/* <Box sx={{ flex: 1, maxHeight: '600px', overflow: 'hidden' }}>
            {selectedFeed?.ImgPath && (
              <img
                src={selectedFeed.ImgPath}
                alt={selectedFeed.imgName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} // 이미지 조정
              />
            )}
          </Box> */}
          <Box sx={{ flex: 1, maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* 로딩 상태 */}
            {imgLoading ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                이미지 로딩 중...
              </Box>
            ) : (
              <>
                {/* 이미지 뷰어 영역 */}
                <Box sx={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
                  {/* prev */}
                  {images.length > 1 && (
                    <IconButton
                      onClick={() => setCurrentImgIdx((i) => (i - 1 + images.length) % images.length)}
                      sx={{ position: 'absolute', left: 8, zIndex: 2, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' }}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                  )}

                  {/* // main image: images 배열에서 가져오거나, 없으면 selectedFeed.ImgPath 사용 */}
                  {images.length > 0 ? (
                    // 현재 인덱스(currentImgIdx)의 미디어를 가져옵니다.
                    images[currentImgIdx].mediaType === 'video' ? (
                      <video
                        src={images[currentImgIdx].ImgPath}
                        controls
                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', height: 'auto'}}
                      >
                        지원하지 않는 동영상 형식입니다.
                      </video>
                    ) : (
                      <img
                        src={images[currentImgIdx].ImgPath}
                        alt={images[currentImgIdx].imgName || selectedFeed?.imgName}
                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', height: 'auto' }}
                        onError={(e) => { e.currentTarget.style.opacity = 0.6; }}
                      />
                    )
                  ) : (
                    <Box sx={{ color: '#fff' }}>이미지가 없습니다</Box>
                  )}

                  {/* next */}
                  {images.length > 1 && (
                    <IconButton
                      onClick={() => setCurrentImgIdx((i) => (i + 1) % images.length)}
                      sx={{ position: 'absolute', right: 8, zIndex: 2, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  )}
                </Box>

                {/* 썸네일 (이미지 여러장일 때만) */}
                {images.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', p: 1, bgcolor: '#fafafa' }}>
                    {images.map((it, idx) => (
                      <Box
                        key={it.imgNo + '-' + idx}
                        onClick={() => setCurrentImgIdx(idx)}
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: idx === currentImgIdx ? '2px solid #1976d2' : '1px solid #ddd',
                          flex: '0 0 auto'
                        }}
                      >
                        <img src={it.ImgPath} alt={it.imgName || ('thumb-' + idx)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </>
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
                label="댓글을 입력하세요."
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