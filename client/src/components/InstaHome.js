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
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRef } from 'react';


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
  let [currentUserId, setCurrentUserId] = useState('');
  let navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  // 상대경로면 서버 호스트를 붙여 절대 URL로 만듭니다.
  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3010${url.startsWith('/') ? '' : '/'}${url}`;
  };

  async function fnGetFeed() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 해주세요");
      navigate("/instalogin");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId);

      // 1) 현재 사용자 정보(우측 요약 아바타용) 가져오기 (선택: 실패해도 진행)
      try {
        const curRes = await fetch(`http://localhost:3010/instauser/user/${decoded.userId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const curData = await curRes.json();
        if (curData && curData.user) {
          curData.user.PROFILE_IMG = normalizeUrl(curData.user.PROFILE_IMG);
          setCurrentUser(curData.user);
        }
      } catch (e) {
        console.warn('current user load failed', e);
        setCurrentUser(null);
      }

      // 2) 피드 목록 가져오기
      const res = await fetch("http://localhost:3010/instahome", {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      const list = Array.isArray(data.list) ? data.list : [];

      // 3) 정규화: ImgPath, USER_PROFILE_IMG 필드 사용(서버가 줄 것으로 기대)
      const normalized = list.map(f => ({
        ...f,
        ImgPath: normalizeUrl(f.ImgPath || f.imgPath || null),
        USER_PROFILE_IMG: normalizeUrl(f.USER_PROFILE_IMG || f.PROFILE_IMG || f.userProfileImg || null)
      }));

      setFeeds(normalized);
      console.log('normalized feeds:', normalized);
    } catch (err) {
      console.error('fnGetFeed error', err);
      setFeeds([]);
    }
  }


  useEffect(() => {
    fnGetFeed()
  }, []);

  const handleClickOpen = (feed) => {
    // alert("handleClickOpen 버튼 눌림"); 
    // setSelectedFeed(feed);
    // setOpen(true);
    // setNewComment('');

    // 이미지 로드
    // setImgLoading(true);
    // setImages([]);
    // setCurrentImgIdx(0);

    // 추가 이미지 가져오기
    // fetch(`http://localhost:3010/instahome/${feed.FEED_ID}/images`)
    //   .then(res => res.json())
    //   .then(data => {
    //     let fetchedImages = Array.isArray(data.images) ? data.images : [];
    //     const primaryMedia = {
    //       imgNo: -1,
    //       ImgPath: feed.ImgPath,
    //       mediaType: feed.mediaType,
    //       imgName: feed.imgName || 'primary-media',
    //     };
    //     const combinedImages = [primaryMedia, ...fetchedImages];
    //     setImages(combinedImages);
    //     setImgLoading(false);
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     if (feed.ImgPath) {
    //       setImages([{
    //         imgNo: -1,
    //         ImgPath: feed.ImgPath,
    //         mediaType: feed.mediaType,
    //         imgName: feed.imgName || 'primary-media'
    //       }]);
    //     }
    //     setImgLoading(false);
    //   });

    // 댓글 목록 가져오기
    // fetch(`http://localhost:3010/instacomment/${feed.FEED_ID}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.result === 'success' && Array.isArray(data.comments)) {
    //       let formattedComments = data.comments.map(comment => ({
    //         id: comment.USER_ID,
    //         text: comment.CONTENT,
    //         avatarUrl: ''
    //       }));
    //       setComments(formattedComments);
    //     } else {
    //       setComments([]);
    //     }
    //   })
    //   .catch(err => {
    //     console.error('댓글 조회 중 에러:', err);
    //     setComments([]);
    //   });
  };

  const commentIconClick = (feed) => {
    // alert("commentIconClick 버튼 눌림"); 
    setSelectedFeed(feed);
    setOpen(true);
    setNewComment('');

    // 이미지 로드
    setImgLoading(true);
    setImages([]);
    setCurrentImgIdx(0);

    // 추가 이미지 가져오기
    fetch(`http://localhost:3010/instahome/${feed.FEED_ID}/images`)
      .then(res => res.json())
      .then(data => {
        let fetchedImages = Array.isArray(data.images) ? data.images : [];
        const primaryMedia = {
          imgNo: -1,
          ImgPath: feed.ImgPath,
          mediaType: feed.mediaType,
          imgName: feed.imgName || 'primary-media',
        };
        const combinedImages = [primaryMedia, ...fetchedImages];
        setImages(combinedImages);
        setImgLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (feed.ImgPath) {
          setImages([{
            imgNo: -1,
            ImgPath: feed.ImgPath,
            mediaType: feed.mediaType,
            imgName: feed.imgName || 'primary-media'
          }]);
        }
        setImgLoading(false);
      });

    // 댓글 목록 가져오기
    fetch(`http://localhost:3010/instacomment/${feed.FEED_ID}`)
      .then(res => res.json())
      .then(data => {
        if (data.result === 'success' && Array.isArray(data.comments)) {
          let formattedComments = data.comments.map(comment => ({
            id: comment.USER_ID,
            text: comment.CONTENT,
            avatarUrl: ''
          }));
          setComments(formattedComments);
        } else {
          setComments([]);
        }
      })
      .catch(err => {
        console.error('댓글 조회 중 에러:', err);
        setComments([]);
      });
  };


  const heartIconClick = (feed) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 해주세요");
      navigate("/instalogin");
      return;
    }

    // UI 즉시 반영
    setFeeds((prevFeeds) =>
      prevFeeds.map((f) => {
        if (f.FEED_ID === feed.FEED_ID) {
          const liked = !f.isLiked;
          return {
            ...f,
            isLiked: liked,
            LIKE_COUNT: liked ? (f.LIKE_COUNT || 0) + 1 : (f.LIKE_COUNT || 0) - 1,
          };
        }
        return f;
      })
    );

    // 서버에 좋아요/취소 요청
    fetch('http://localhost:3010/instafeed/instaheart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      body: JSON.stringify({
        feedId: feed.FEED_ID,
        userId: currentUserId,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.result !== 'success') {
          alert(data.message || '좋아요 업데이트 실패');
          // 실패하면 상태 롤백
          setFeeds((prevFeeds) =>
            prevFeeds.map((f) => f.FEED_ID === feed.FEED_ID ? { ...f, isLiked: feed.isLiked, LIKE_COUNT: feed.LIKE_COUNT } : f)
          );
        }
      })
      .catch(err => {
        console.error(err);
        // 에러 발생 시 상태 롤백
        setFeeds((prevFeeds) =>
          prevFeeds.map((f) => f.FEED_ID === feed.FEED_ID ? { ...f, isLiked: feed.isLiked, LIKE_COUNT: feed.LIKE_COUNT } : f)
        );
      });
  };


  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
    setImages([]);
    setCurrentImgIdx(0);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedFeed) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/instalogin");
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.userId;

    // 댓글 등록
    fetch('http://localhost:3010/instacomment/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedId: selectedFeed.FEED_ID,
        userId: userId,
        content: newComment.trim()
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === 'success') {
          // 댓글 등록 성공 후 댓글 목록 새로고침
          fetch(`http://localhost:3010/instacomment/${selectedFeed.FEED_ID}`)
            .then(res => res.json())
            .then(commentData => {
              if (commentData.result === 'success' && Array.isArray(commentData.comments)) {
                let formattedComments = commentData.comments.map(comment => ({
                  id: comment.USER_ID,
                  text: comment.CONTENT,
                  avatarUrl: ''
                }));
                setComments(formattedComments);
              }
              setNewComment('');
            })
            .catch(err => {
              console.error('댓글 새로고침 중 에러:', err);
              setNewComment('');
            });
        } else {
          alert('댓글 등록에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('댓글 등록 중 에러:', error);
        alert('댓글 등록 중 오류가 발생했습니다.');
      });
  };

  let fndelete = () => {
    if (!selectedFeed) return;
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3010/instahome/" + selectedFeed.FEED_ID, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.result === "success") {
            alert("삭제되었습니다.");
            setOpen(false);
            fnGetFeed();
          } else {
            alert(data.message || "삭제에 실패했습니다.");
          }
        })
        .catch(error => {
          console.error("삭제 중 에러:", error);
          alert("InstaHome.js파일에서 삭제 중 오류가 발생했습니다.");
        })
    } else {
      alert("로그인 해주세요");
      navigate("/instalogin");
    }
  };

  const recommendations = [
    { id: 'realigh', name: '선경원' },
    { id: 'h_y_oung', name: '회원님을 위한 추천' },
    { id: 'mutual_park', name: '회원님을 위한 추천' },
    { id: '99roomy', name: '회원님을 위한 추천' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Box sx={{ flexGrow: 0, ml: '260px', pt: 4, px: 2 }}>
        <Grid2 container spacing={3} justifyContent="center">

          {/* 2-A. 중앙 메인 피드 영역 */}
          <Grid2 xs={12} md={7} sx={{ pr: 20 }}>
            {/* 메인 피드 목록 */}
            {feeds.length > 0 ? (
              feeds.map((feed) => (
                <Card key={feed.FEED_ID || feed.id} sx={{ mb: 4, border: '1px solid #dbdbdb', boxShadow: 'none' }}>
                  {/* 피드 헤더 */}
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{ width: 32, height: 32, mr: 1 }}
                      src={feed.USER_PROFILE_IMG || feed.PROFILE_IMG || '/fallback-avatar.png'}
                      alt={feed.USERNAME || feed.USER_ID || feed.userId}
                      onError={(e) => { e.currentTarget.src = '/fallback-avatar.png'; }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">{feed.USER_ID || feed.userId}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small">...</IconButton>
                  </Box>

                  {/* 피드 미디어 영역 */}
                  <Box
                    onClick={() => handleClickOpen(feed)}
                    sx={{ cursor: 'pointer', maxHeight: '1000px', maxWidth: '600px' }} //objectFit: 'cover' 251202삭제
                  >

                    {feed.mediaType === 'video' ? (
                      <video
                        ref={(el) => {
                          if (!el) return;

                          const observer = new IntersectionObserver(
                            ([entry]) => {
                              if (!el) return;
                              try {
                                if (entry.isIntersecting) {
                                  el.play().catch(err => {
                                    // play 중 오류 무시 (자동 재생 차단 등)
                                    console.warn('Video play error:', err);
                                  });
                                } else {
                                  el.pause();
                                }
                              } catch (err) {
                                console.warn('Video play/pause error:', err);
                              }
                            },
                            { threshold: 0.5 }
                          );

                          observer.observe(el);
                        }}
                        src={feed.ImgPath}
                        controls
                        muted
                        loop
                        style={{ width: '100%', maxHeight: '700px'}} //, objectFit: 'cover' 
                      >
                        지원하지 않는 동영상 형식입니다.
                      </video>
                    ) : (
                      <CardMedia
                        component="img"
                        image={feed.ImgPath}
                        alt={feed.imgName}
                        sx={{ maxHeight: '600px', objectFit: 'cover' }}
                      />
                    )}
                  </Box>

                  {/* 액션 버튼 */}
                  {/* <Box sx={{ p: 1 }}>
                    <IconButton onClick={() => heartIconClick(feed)}><FavoriteBorderIcon /></IconButton>
                    <IconButton onClick={() => commentIconClick(feed)}><ModeCommentOutlinedIcon /></IconButton>
                    <IconButton onClick={() => commentIconClick(feed)}><SendIcon /></IconButton>
                  </Box> */}
                  {/* 액션 버튼 */}
                  <Box sx={{ p: 1 }}>
                    {/* 좋아요 상태(feed.isLiked)에 따라 아이콘과 색상 변경 */}
                    <IconButton onClick={() => heartIconClick(feed)}>
                      {feed.isLiked ? (
                        // 좋아요를 눌렀을 때: 채워진 빨간 하트
                        <FavoriteIcon sx={{ color: 'red' }} />
                      ) : (
                        // 좋아요를 누르지 않았을 때: 빈 하트
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                    <IconButton onClick={() => commentIconClick(feed)}><ModeCommentOutlinedIcon /></IconButton>
                    <IconButton onClick={() => commentIconClick(feed)}><SendIcon /></IconButton>
                  </Box>

                  {/* 좋아요 수 및 내용 */}
                  <CardContent sx={{ pt: 0 }}>
                    {/* <Typography variant="subtitle2" fontWeight="bold">좋아요 1,234개</Typography> */}
                    <Typography variant="subtitle2" fontWeight="bold">좋아요 {feed.LIKE_COUNT || '0'}개</Typography>
                    <Typography variant="body2" sx={{ my: 0.5, width: '550px' }}>
                      <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{feed.USER_ID || feed.userId}</Typography>
                      {feed.CONTENT || feed.content}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" onClick={() => commentIconClick(feed)} sx={{ cursor: 'pointer' }}>
                      댓글 보기...
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
                <Avatar
                  sx={{ width: 56, height: 56, mr: 2 }}
                  src={currentUser?.PROFILE_IMG || '/fallback-avatar.png'}
                  alt={currentUser?.USERNAME || currentUser?.USER_ID || 'currentUser'}
                  onError={(e) => { e.currentTarget.src = '/fallback-avatar.png'; }}
                />

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

      {/* 피드 상세 모달 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedFeed?.TITLE || selectedFeed?.title || selectedFeed?.USER_ID || selectedFeed?.userId}
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

                  {images.length > 0 ? (
                    images[currentImgIdx].mediaType === 'video' ? (
                      <video
                        src={images[currentImgIdx].ImgPath}
                        controls
                        style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', height: 'auto' }}
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
                <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{selectedFeed?.USER_ID || selectedFeed?.userId}</Typography>
                {selectedFeed?.CONTENT || selectedFeed?.content}
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
          {selectedFeed && (selectedFeed.USER_ID || selectedFeed.userId) === currentUserId && (
            <Button onClick={fndelete} variant='contained' color="primary">
              삭제
            </Button>
          )}
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InstaHome;