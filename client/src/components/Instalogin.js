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
  Container,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// 로컬 업로드 파일 경로(내가 제공한 경로 사용)
// const hero = "/mnt/data/00bf334c-3853-4882-9ced-83538911fac8.png";

// 또는 외부 URL을 직접 쓰려면 아래처럼:
// let hero = "https://www.instagram.com/images/assets_DO_NOT_HARDCODE/lox_brand/landing-2x.png";
let hero = "/insta-hero.png";

export default function Login() {
  const userId = useRef();
  const pwd = useRef();
  const navigate = useNavigate();

  const doLogin = async () => {
    const param = {
      userId: userId.current?.value || "",
      pwd: pwd.current?.value || "",
    };

    try {
      const res = await fetch("http://localhost:3010/user/login", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(param),
      });
      const data = await res.json();
      alert(data.msg);
      if (data.result) {
        localStorage.setItem("token", data.token);
        navigate("/feed");
      }
    } catch (err) {
      console.error(err);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#fafafa',
      }}
    >
      {/* LEFT - hero artwork: md 이상에서만 보이게 */}
      <Box
        sx={{
          // flex: 1.1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box
          sx={{
            width: 650,
            maxWidth: '90%',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
            borderRadius: 3,
            overflow: 'visible',
            background: 'transparent',
            transform: 'none',
          }}
        >
          {/* 이미지가 카드처럼 보이도록 살짝 여백/그림자 적용 */}
          <img
            src={hero}
            alt="instagram-hero"
            style={{
              width: '100%',
              // width: '1000px',
              display: 'block',
              borderRadius: 12,
            }}
          />
        </Box>
      </Box>

      {/* RIGHT - login card centered */}
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center'}} >
        <Box
          sx={{
            width: '100%',
            maxWidth: 380,
            mx: 'auto',
            my: { xs: 6, md: 0 },
            textAlign: 'center',
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
              startIcon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877f2" d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H22z"/></svg>}
              sx={{
                mt: 1,
                color: '#385898',
                textTransform: 'none',
                fontWeight: 600,
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
              <MuiLink component={Link} to="/join" underline="hover">
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
      </Container>
    </Box>
  );
}
