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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';


// const mockFeeds = [
//   {
//     id: 1,
//     title: '게시물 1',
//     description: '이것은 게시물 1의 설명입니다.',
//     image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
//   },
//   {
//     id: 2,
//     title: '게시물 2',
//     description: '이것은 게시물 2의 설명입니다.',
//     image: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664',
//   },
//   // 추가 피드 데이터
// ];

function Feed() {


  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  let [feeds, setFeeds] = useState([]);
  let navigate = useNavigate();

  function fnGetFeed() {
    // 일단 userId 하드코딩
    // let userId = "qw123";

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("decode==> ", decoded);
      // let id = "qw123";
      fetch("http://localhost:3010/feed/" + decoded.userId)
        .then(res => res.json())
        .then(data => {

          console.log("피드, 돌아온데이터 JOSN변환 " + JSON.stringify(data));

          setFeeds(data.list);

          // setUser(data.user);
        })
    } else {
      alert("로그인 해주세요");
      //화면을 부드럽게 옮길수 있음 리엑트 장점 (안깜박임)
      navigate("/");
    }



    // fetch("http://localhost:3010/feed/" + userId)
    //   .then(res => res.json())
    //   .then(data => {
    //     // console.log("돌아온데이터"+ JSON.stringify(data));
    //     console.log("돌아온데이터 ", data);
    //     setFeeds(data.list);
    //   })
  }

  useEffect(() => {
    fnGetFeed()
  }, []);



  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
      { id: 'user3', text: '아름다운 풍경이네요!' },
    ]); // 샘플 댓글 추가
    setNewComment(''); // 댓글 입력 초기화
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]); // 모달 닫을 때 댓글 초기화
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: 'currentUser', text: newComment }]); // 댓글 작성자 아이디 추가
      setNewComment('');
    }
  };

  let fndelete = () => {
    alert("삭제버튼 눌림");

    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log("삭제중 decode==> ", decoded);
      console.log("pk는 ", selectedFeed.id);
      let param = { id: selectedFeed.id };
      // let id = "qw123";
      fetch("http://localhost:3010/feed/" + selectedFeed.id, {
        method: "DELETE",
        headers: { "Content-type": "application/json" }, //headers임!
        body: JSON.stringify(param),
      })
        .then(res => res.json())
        .then(data => {

          console.log("피드, 돌아온데이터 JOSN변환 " + JSON.stringify(data));

          setFeeds(data.list);
          setOpen(false);
          fnGetFeed();
          // setUser(data.user);
        })
    } else {
      alert("로그인 해주세요");
      //화면을 부드럽게 옮길수 있음 리엑트 장점 (안깜박임)
      navigate("/");
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SNS</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {
            feeds.length > 0 ?
              feeds.map((feed) => (
                <Grid2 xs={12} sm={6} md={4} key={feed.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={feed.imgPath}
                      alt={feed.imgName}
                      onClick={() => handleClickOpen(feed)}
                      style={{ cursor: 'pointer' }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        {feed.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              ))
              : "등록된 피드가 없습니다 피드를 등록해주세요!"}
        </Grid2>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
        <DialogTitle>
          {selectedFeed?.title}
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
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.content}</Typography>
            {selectedFeed?.imgPath && (
              <img
                src={selectedFeed.imgPath}
                alt={selectedFeed.imgName}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}
          </Box>

          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar> {/* 아이디의 첫 글자를 아바타로 표시 */}
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.id} /> {/* 아이디 표시 */}
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            // console.log(selectedFeed);
            // 삭제요청 하면서 selectedFeed.id를 보낸다.
            // fndelete()
            fetch("http://localhost:3010/feed/" + selectedFeed.id, {
              method: "DELETE",
              headers: {
                "Authorization": "Bearer " + localStorage.getItem("token") //token을꺼냄
              }
            })
              .then(res => res.json())
              .then(data => {
                alert("삭제되었습니다.");
                setOpen(false);
                fnGetFeed();
              })
          }} variant='contained' color="primary">
            삭제
          </Button>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>

        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;