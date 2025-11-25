// Login.js
import React, { useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Paper,
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// 로컬 업로드 파일 경로
let hero = "/insta-hero.png";

function Instalogin() {
  let userId = useRef();
  let pwd = useRef();
  let navigate = useNavigate();

  function doLogin() {
    let param = {
      userId: userId.current.value,
      pwd: pwd.current.value,
    };

    fetch("http://localhost:3010/user/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(param),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        if (data.result) {
          localStorage.setItem("token", data.token);
          navigate("/feed");
        }
      })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
      }}
    >
      {/* 중앙 컨테이너 - 이미지와 로그인 폼을 나란히 배치 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0, md: 8 },
          maxWidth: { xs: '100%', md: '935px' },
          width: '100%',
        }}
      >
        {/* LEFT - hero artwork: md 이상에서만 보이게 */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          <Box
            sx={{
              width: 380,
              position: 'relative',
            }}
          >
            <img
              src={hero}
              alt="instagram-hero"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>
        </Box>

        {/* RIGHT - login card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 350,
            flex: '0 0 auto',
            textAlign: 'center',
            my: { xs: 4, md: 0 },
          }}
        >
          {/* logo */}
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontFamily: '"Billabong", "cursive", "serif"',
              fontSize: 48,
              mb: 2,
            }}
          >
            Instagram
          </Typography>

          {/* Card */}
          <Paper elevation={1} sx={{ p: 4, mb: 2 }}>
            <TextField
              inputRef={userId}
              label="전화번호, 사용자 이름 또는 이메일"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
            />
            <TextField
              inputRef={pwd}
              label="비밀번호"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
              type="password"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={doLogin}
              sx={{
                mt: 2,
                mb: 1,
                backgroundColor: '#0095f6',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#007ad9' },
              }}
            >
              로그인
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" sx={{ mx: 1, color: 'text.secondary' }}>
                또는
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <Button
              startIcon={
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{ display: 'block', flexShrink: 0 }}
                >
                  <path 
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" 
                    fill="#1877f2"
                  />
                </svg>
              }
              sx={{
                mt: 1,
                color: '#385898',
                textTransform: 'none',
                fontWeight: 600,
                '& .MuiButton-startIcon': {
                  marginRight: 1,
                },
              }}
              fullWidth
            >
              Facebook으로 로그인
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              <MuiLink component={Link} to="/find-password" underline="none">
                비밀번호를 잊으셨나요?
              </MuiLink>
            </Typography>
          </Paper>

          {/* Signup card */}
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2">
              계정이 없으신가요?{' '}
              <MuiLink component={Link} to="/instajoin" underline="hover">
                회원가입
              </MuiLink>
            </Typography>
          </Paper>

          {/* Footer small text like Instagram */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mb: 1 }}>
              한국어
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} Instagram from Meta
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Instalogin;
