// LoginPage.jsx
// MUI 기반 반응형 로그인 화면 컴포넌트
// 사용법: 이 파일을 프로젝트 src/components/LoginPage.jsx로 저장한 뒤
// App.js에서 `import LoginPage from './components/LoginPage'` 후 <LoginPage />로 렌더링하세요.

import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function LoginPage({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = '이메일을 입력해 주세요.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = '유효한 이메일을 입력하세요.';
    if (!password) e.password = '비밀번호를 입력해 주세요.';
    else if (password.length < 6) e.password = '비밀번호는 최소 6자 이상입니다.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // 호출자에게 폼 데이터 전달(있는 경우)
    const payload = { email, password, remember };
    if (onSubmit) onSubmit(payload);
    else console.log('로그인 시도', payload);
  };

  const handleSocial = (provider) => {
    // 소셜 로그인 버튼 클릭 처리 (실제 구현은 백엔드/라이브러리 필요)
    console.log('소셜 로그인:', provider);
  };

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Paper elevation={6} sx={{ mt: 8, mb: 8, borderRadius: 3, overflow: 'hidden' }}>
        <Grid container>
          {/* 왼쪽 정보/이미지 패널 */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg,#1976d2 0%, #63a4ff 100%)',
              color: 'white',
              p: 4,
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 380 }}>
              <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                환영합니다
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
                계정에 로그인하여 대시보드와 서비스에 접속하세요.
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {/* 필요하면 이미지나 추가 문구 삽입 */}
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  빠르고 안전한 로그인 경험을 제공합니다.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 오른쪽 폼 패널 */}
          <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 6 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                로그인
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="이메일 주소"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="비밀번호"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                />

                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                  label="로그인 상태 유지"
                />

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 1, py: 1.2 }}>
                  로그인
                </Button>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      비밀번호를 잊으셨나요?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {'계정이 없으신가요? 회원가입'}
                    </Link>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}>또는</Divider>

                <Grid container spacing={1} justifyContent="center">
                  <Grid item>
                    <IconButton aria-label="google" onClick={() => handleSocial('google')}>
                      <GoogleIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton aria-label="facebook" onClick={() => handleSocial('facebook')}>
                      <FacebookIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <IconButton aria-label="github" onClick={() => handleSocial('github')}>
                      <GitHubIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Typography variant="caption" display="block" align="center" sx={{ mt: 3 }}>
                  계속 진행하면 서비스 이용약관 및 개인정보 취급방침에 동의하게 됩니다.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="caption">© {new Date().getFullYear()} Your Company. All rights reserved.</Typography>
      </Box>
    </Container>
  );
}
