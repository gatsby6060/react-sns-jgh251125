import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function InstaExplore() {
  let [feeds, setFeeds] = useState([]);
  let [currentUserId, setCurrentUserId] = useState('');
  let navigate = useNavigate();

  // 모달 관련 state
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [images, setImages] = useState([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);

  // 상대경로면 서버 호스트를 붙여 절대 URL로 만듭니다.
  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3010${url.startsWith('/') ? '' : '/'}${url}`;
  };

  function fnGetExplore() {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("decode==> ", decoded);
      setCurrentUserId(decoded.userId);
      fetch("http://localhost:3010/instahome", {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(res => res.json())
        .then(data => {
          console.log("탐색 피드, 돌아온데이터 " + JSON.stringify(data));
          if (data.list && Array.isArray(data.list)) {
            // URL 정규화 적용
            const normalized = data.list.map(f => ({
              ...f,
              ImgPath: normalizeUrl(f.ImgPath || f.imgPath || null),
            }));
            setFeeds(normalized);
          } else {
            setFeeds([]);
          }
        })
        .catch(err => {
          console.error("탐색 피드 조회 중 에러:", err);
          setFeeds([]);
        });
    } else {
      alert("로그인 해주세요");
      navigate("/instalogin");
    }
  }

  useEffect(() => {
    fnGetExplore();
  }, []);

  const handleClickOpen = (feed) => {
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
          setImages([{ imgNo: -1, ImgPath: feed.ImgPath, mediaType: feed.mediaType, imgName: feed.imgName || 'primary-media' }]);
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

  const handlePrevImage = () => {
    if (currentImgIdx > 0) {
      setCurrentImgIdx(currentImgIdx - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImgIdx < images.length - 1) {
      setCurrentImgIdx(currentImgIdx + 1);
    }
  };

  const getMediaType = (path) => {
    if (!path) return 'image';
    const ext = path.toLowerCase().split('.').pop();
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    return videoExts.includes(ext) ? 'video' : 'image';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          탐색
        </Typography>
        <Typography variant="body2" color="text.secondary">
          새로운 게시물을 발견해보세요
        </Typography>
      </Box>

      {feeds.length > 0 ? (
        <ImageList 
          sx={{ width: '100%', height: 'auto' }} 
          cols={3} 
          rowHeight={300}
          gap={2}
        >
          {feeds.map((feed) => (
            <ImageListItem 
              key={feed.FEED_ID} 
              sx={{ cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => handleClickOpen(feed)}
            >
              {feed.mediaType === 'video' || getMediaType(feed.ImgPath) === 'video' ? (
                <video
                  src={feed.ImgPath}
                  alt={feed.imgName || '피드 이미지'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  muted
                />
              ) : (
                <img
                  srcSet={`${feed.ImgPath}?w=300&h=300&fit=crop&auto=format&dpr=2 2x`}
                  src={`${feed.ImgPath}?w=300&h=300&fit=crop&auto=format`}
                  alt={feed.imgName || feed.TITLE || '피드 이미지'}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            탐색할 게시물이 없습니다.
          </Typography>
        </Box>
      )}

      {/* 상세보기 모달 */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedFeed?.TITLE || '게시물'}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFeed && (
            <Box>
              {/* 이미지/비디오 슬라이더 */}
              {imgLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>로딩 중...</Typography>
                </Box>
              ) : images.length > 0 ? (
                <Box sx={{ position: 'relative', mb: 2 }}>
                  {images[currentImgIdx] && (
                    <>
                      {images[currentImgIdx].mediaType === 'video' || getMediaType(images[currentImgIdx].ImgPath) === 'video' ? (
                        <video
                          src={images[currentImgIdx].ImgPath}
                          controls
                          style={{
                            width: '100%',
                            maxHeight: '500px',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <img
                          src={images[currentImgIdx].ImgPath}
                          alt={images[currentImgIdx].imgName || '피드 이미지'}
                          style={{
                            width: '100%',
                            maxHeight: '500px',
                            objectFit: 'contain',
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* 이미지 네비게이션 버튼 */}
                  {images.length > 1 && (
                    <>
                      {currentImgIdx > 0 && (
                        <IconButton
                          onClick={handlePrevImage}
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                          }}
                        >
                          <ArrowBackIosNewIcon />
                        </IconButton>
                      )}
                      {currentImgIdx < images.length - 1 && (
                        <IconButton
                          onClick={handleNextImage}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                          }}
                        >
                          <ArrowForwardIosIcon />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              ) : null}

              {/* 게시물 내용 */}
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                {selectedFeed.CONTENT || selectedFeed.content || ''}
              </Typography>

              {/* 댓글 목록 */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                댓글
              </Typography>
              <List sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {comment.id ? comment.id.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {comment.id || '익명'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body2" color="text.secondary">
                          댓글이 없습니다.
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>

              {/* 댓글 입력 */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{
                    backgroundColor: '#0095f6',
                    '&:hover': { backgroundColor: '#007ad9' },
                  }}
                >
                  게시
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default InstaExplore;

