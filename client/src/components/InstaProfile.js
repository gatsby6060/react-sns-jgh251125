import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid2,
  Button,
  Card,
  CardMedia,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';

function InstaProfile() {
  let [user, setUser] = useState(null);
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

  // 프로필 사진 변경 모달
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const fileInputRef = React.useRef(null);

  function fnGetUser() {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("decode==> ", decoded);
      setCurrentUserId(decoded.userId);

      // 사용자 정보 가져오기
      fetch("http://localhost:3010/instauser/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          console.log("사용자 정보: ", data);
          setUser(data.user);
        })
        .catch(err => {
          console.error("사용자 정보 조회 중 에러:", err);
        });

      // 사용자 피드 목록 가져오기
      fetch("http://localhost:3010/instahome/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          console.log("피드 목록 원본 데이터: ", data);
          if (data.list && Array.isArray(data.list)) {
            // 중복 제거 (FEED_ID 기준)
            const uniqueFeeds = [];
            const seenFeedIds = new Set();
            data.list.forEach(feed => {
              const feedId = feed.FEED_ID || feed.id;
              if (feedId && !seenFeedIds.has(feedId)) {
                seenFeedIds.add(feedId);
                uniqueFeeds.push(feed);
                console.log("피드 추가:", feedId, "이미지 경로:", feed.ImgPath || feed.imgPath);
              }
            });
            console.log("최종 피드 개수:", uniqueFeeds.length);
            setFeeds(uniqueFeeds);
          } else {
            setFeeds([]);
          }
        })
        .catch(err => {
          console.error("피드 목록 조회 중 에러:", err);
          setFeeds([]);
        });
    } else {
      alert("로그인 해주세요");
      navigate("/instalogin");
    }
  }

  useEffect(() => {
    fnGetUser();
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
          ImgPath: feed.ImgPath || feed.imgPath,
          mediaType: feed.mediaType,
          imgName: feed.imgName || 'primary-media',
        };
        const combinedImages = [primaryMedia, ...fetchedImages];
        setImages(combinedImages);
        setImgLoading(false);
      })
      .catch(err => {
        console.error(err);
        if (feed.ImgPath || feed.imgPath) {
          setImages([{ 
            imgNo: -1, 
            ImgPath: feed.ImgPath || feed.imgPath, 
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
            fnGetUser(); // 피드 목록 새로고침
          } else {
            alert(data.message || "삭제에 실패했습니다.");
          }
        })
        .catch(error => {
          console.error("삭제 중 에러:", error);
          alert("삭제 중 오류가 발생했습니다.");
        })
    } else {
      alert("로그인 해주세요");
      navigate("/instalogin");
    }
  };

  const handleProfileUpload = (file) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/instalogin");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:3010/instauser/profile/upload', {
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token
        // FormData 사용 시 Content-Type은 설정하지 않음 (브라우저가 자동 설정)
      },
      body: formData
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("token");
          navigate("/instalogin");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.result === 'success') {
          alert("프로필 사진이 업로드되었습니다.");
          setProfileModalOpen(false);
          fnGetUser(); // 사용자 정보 새로고침
        } else {
          alert(data.message || data.error || "업로드에 실패했습니다.");
        }
      })
      .catch(error => {
        console.error('프로필 사진 업로드 중 에러:', error);
        alert('프로필 사진 업로드 중 오류가 발생했습니다.');
      });
  };

  const handleProfileDelete = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/instalogin");
      return;
    }

    if (!window.confirm("프로필 사진을 삭제하시겠습니까?")) {
      return;
    }

    fetch('http://localhost:3010/instauser/profile/image', {
      method: 'DELETE',
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("token");
          navigate("/instalogin");
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.result === 'success') {
          alert("프로필 사진이 삭제되었습니다.");
          setProfileModalOpen(false);
          fnGetUser(); // 사용자 정보 새로고침
        } else {
          alert(data.message || data.error || "삭제에 실패했습니다.");
        }
      })
      .catch(error => {
        console.error('프로필 사진 삭제 중 에러:', error);
        alert('프로필 사진 삭제 중 오류가 발생했습니다.');
      });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '935px', margin: '0 auto', padding: '30px 20px' }}>
      {/* 프로필 헤더 */}
      <Box sx={{ display: 'flex', mb: 4 }}>
        {/* 프로필 이미지 */}
        <Box sx={{ mr: 5 }}>
          <Avatar
            sx={{ 
              width: 150, 
              height: 150, 
              border: '1px solid #dbdbdb',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            src={user.PROFILE_IMG || ''}
            onClick={() => setProfileModalOpen(true)}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleProfileUpload(file);
              }
            }}
          />
        </Box>

        {/* 프로필 정보 */}
        <Box sx={{ flexGrow: 1 }}>
          {/* 사용자 이름과 설정 버튼 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ mr: 2, fontWeight: 300 }}>
              {user.USERNAME || user.USER_ID}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mr: 1, textTransform: 'none', borderRadius: '4px' }}
            >
              프로필 편집
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', borderRadius: '4px' }}
            >
              보관함 보기
            </Button>
            <SettingsIcon sx={{ ml: 1, cursor: 'pointer' }} />
          </Box>

          {/* 통계 정보 */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography sx={{ mr: 4 }}>
              <strong>{feeds.length}</strong> 게시물
            </Typography>
            <Typography sx={{ mr: 4, cursor: 'pointer' }}>
              <strong>{user.FOLLOWER || 0}</strong> 팔로워
            </Typography>
            <Typography sx={{ cursor: 'pointer' }}>
              <strong>{user.FOLLOWING || 0}</strong> 팔로잉
            </Typography>
          </Box>

          {/* 사용자 이름과 소개 */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user.USERNAME || user.USER_ID}
            </Typography>
            {user.INTRO && (
              <Typography variant="body2">
                {user.INTRO}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 게시물 탭 */}
      <Box sx={{ mb: 3, borderTop: '1px solid #dbdbdb' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            sx={{
              textTransform: 'uppercase',
              fontSize: '12px',
              fontWeight: 600,
              color: '#262626',
              borderTop: '1px solid #262626',
              borderRadius: 0,
              px: 3,
              py: 1.5,
              mt: '-1px'
            }}
          >
            게시물
          </Button>
        </Box>
      </Box>

      {/* 피드 그리드 */}
      {feeds.length > 0 ? (
        <Grid2 container spacing={1}>
          {feeds.map((feed) => (
            <Grid2 xs={4} key={feed.FEED_ID || feed.id}>
              <Card
                sx={{
                  aspectRatio: '1',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => handleClickOpen(feed)}
              >
                {feed.mediaType === 'video' ? (
                  <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      src={feed.ImgPath || feed.imgPath}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      muted
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        color: 'white',
                        fontSize: '16px'
                      }}
                    >
                      ▶
                    </Box>
                  </Box>
                ) : (
                  <CardMedia
                    component="img"
                    image={feed.ImgPath || feed.imgPath}
                    alt={feed.imgName || 'feed image'}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error("이미지 로드 실패:", feed.ImgPath || feed.imgPath);
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </Card>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="textSecondary">
            게시물이 없습니다
          </Typography>
        </Box>
      )}

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
                <Typography component="span" fontWeight="bold" sx={{ mr: 1 }}>{selectedFeed?.USER_ID || selectedFeed?.userId}</Typography>
                {selectedFeed?.CONTENT || selectedFeed?.content}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2 }}>
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

      {/* 프로필 사진 변경 모달 */}
      <Dialog open={profileModalOpen} onClose={() => setProfileModalOpen(false)}>
        <DialogTitle>프로필 사진 바꾸기</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: '300px' }}>
            <Button
              variant="text"
              fullWidth
              sx={{ textAlign: 'left', justifyContent: 'flex-start', py: 1.5 }}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              사진 업로드
            </Button>
            {user.PROFILE_IMG && (
              <Button
                variant="text"
                fullWidth
                sx={{ textAlign: 'left', justifyContent: 'flex-start', py: 1.5, color: 'error.main' }}
                onClick={handleProfileDelete}
              >
                현재 사진 삭제
              </Button>
            )}
            <Button
              variant="text"
              fullWidth
              sx={{ textAlign: 'left', justifyContent: 'flex-start', py: 1.5 }}
              onClick={() => setProfileModalOpen(false)}
            >
              취소
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default InstaProfile;

