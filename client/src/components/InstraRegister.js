import React, { useRef } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Paper,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function Register() {
  const [files, setFile] = React.useState([]);
  const [category, setCategory] = React.useState('');
  const titleRef = useRef();
  const contentRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile([...event.target.files]); // FileList → Array
  };

  function fnFeedAdd() {
    if (files.length === 0) {
      alert("이미지를 선택해주세요!");
      return;
    }

    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode(token) : { userId: null };
    let param = {
      title: titleRef.current.value,
      content: contentRef.current.value,
      userId: decoded.userId,
      category,
    };

    fetch("http://localhost:3010/instafeed/", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(param),
    })
      .then(res => res.json())
      .then(data => {
        alert("게시물이 등록되었습니다.");
        fnUploadFile(data.result[0].insertId);
      })
      .catch(err => {
        console.error(err);
        alert("등록 중 오류가 발생했습니다.");
      });
  }

  const fnUploadFile = (feedId) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
    formData.append("feedId", feedId);
    fetch("http://localhost:3010/instafeed/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(() => {
        navigate("/instahome");
      })
      .catch(err => {
        console.error(err);
        alert("파일 업로드 중 오류가 발생했습니다.");
      });
  };

  const firstPreview = files[0] ? URL.createObjectURL(files[0]) : null;

  return (
    <Container sx={{ py: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          minHeight: '90vh',
          // minWidth: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* Header: Instagram-like look */}
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              // fontFamily: "'Pacifico', cursive", // 실제 폰트가 없으면 대체되지만 느낌을 위해 표기
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            게시물 만들기
          </Typography>
          <Typography variant="caption" color="text.secondary">
            오늘의 순간을 공유해보세요
          </Typography>
        </Box>

        {/* Main content area: left preview, right inputs (stacked on small screens) */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            gap: 3,
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {/* Preview area */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 220 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', sm: 220 },
                height: { xs: 220, sm: 220 },
                borderRadius: 3,
                overflow: 'hidden',
                background:
                  'linear-gradient(135deg, rgba(250,250,250,0.6), rgba(245,245,245,0.4))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
              }}
            >
              {firstPreview ? (
                // 큰 미리보기
                <img
                  src={firstPreview}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', px: 2 }}>
                  <Typography variant="subtitle1">미리보기</Typography>
                  <Typography variant="caption" color="text.secondary">
                    사진이나 동영상을 업로드하면 여기에 표시됩니다
                  </Typography>
                </Box>
              )}
            </Box>

            {/* 썸네일 행 */}
            {files.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', width: '100%' }}>
                {files.map((file, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      minWidth: 56,
                      minHeight: 56,
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fafafa',
                    }}
                  >
                    {file.type.startsWith('video/') ? (
                      <Typography variant="caption">🎥</Typography>
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Input area */}
          <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={category}
                label="카테고리"
                onChange={(e) => setCategory(e.target.value)}
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value={1}>일상</MenuItem>
                <MenuItem value={2}>여행</MenuItem>
                <MenuItem value={3}>음식</MenuItem>
                <MenuItem value={4}>운동</MenuItem>
              </Select>
            </FormControl>

            <TextField
              inputRef={titleRef}
              label="제목"
              variant="outlined"
              margin="dense"
              fullWidth
              sx={{ borderRadius: 1 }}
            />

            <TextField
              inputRef={contentRef}
              label="내용"
              variant="outlined"
              margin="dense"
              fullWidth
              multiline
              rows={12}
              sx={{ borderRadius: 1 }}
            />

            {/* File upload row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <input
                accept="image/*,video/mp4,video/quicktime"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                multiple
              />
              <label htmlFor="file-upload">
                <IconButton
                  component="span"
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    '&:hover': { bgcolor: '#fff' },
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>

              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {files.length > 0 ? `${files.length}개 파일 선택됨` : '첨부할 파일 선택'}
              </Typography>
            </Box>

            {/* 등록 버튼 (instagram-ish gradient) */}
            <Button
              variant="contained"
              fullWidth
              onClick={fnFeedAdd}
              sx={{
                mt: 1,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                backgroundImage:
                  'linear-gradient(45deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              }}
            >
              등록하기
            </Button>
          </Box>
        </Box>

        {/* small hint/footer */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Tip: 사진을 여러 장 선택하면 앨범처럼 업로드됩니다.
        </Typography>
      </Paper>
    </Container>
  );
}

export default Register;
