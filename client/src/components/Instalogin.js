// Login.js
import React, { useRef, useEffect } from 'react';
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
import hero from '../assets/insta-hero.png'; // 현재 파일 위치에 따라 경로 조정

// 로컬 업로드 파일 경로
// let hero = "../src/assets/insta-hero.png";

function InstaLogin() {
  let userId = useRef();
  let pwd = useRef();
  let navigate = useNavigate();

  // //251130카카오로그인 관련2: 카카오 SDK 초기화 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    // 카카오 SDK가 로드될 때까지 대기
    const initKakao = () => {
      if (window.Kakao) {
        // 카카오 SDK가 이미 초기화되어 있지 않다면 초기화
        if (!window.Kakao.isInitialized()) {
          // 여기에 카카오 JavaScript 키를 입력하세요
          // 예: window.Kakao.init('your_kakao_javascript_key_here');
          // 임시로 테스트용 키를 사용하거나, 환경변수로 관리하세요
          try {
            window.Kakao.init('45bdf1dec9fbb56badb6c97f1aa503e8');
          } catch (e) {
            console.log('카카오 SDK 초기화 실패:', e);
          }
        }
      } else {
        // SDK가 아직 로드되지 않았다면 잠시 후 다시 시도
        setTimeout(initKakao, 100);
      }
    };
    
    initKakao();
  }, []);

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
              onClick={() => {
                let param = {
                  userId: userId.current.value,
                  pwd: pwd.current.value,
                };

                fetch("http://localhost:3010/instauser/login", {
                  method: "POST",
                  headers: { "Content-type": "application/json" },
                  body: JSON.stringify(param),
                })
                  .then(res => res.json())
                  .then(data => {
                    alert(data.msg);
                    if (data.result) {
                      localStorage.setItem("token", data.token);
                      navigate("/instaHome");
                    }
                  })
                  .catch(err => {
                    console.error(err);
                    alert("서버 통신 중 오류가 발생했습니다.");
                  });
              }}
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
              // startIcon : 버튼 왼쪽에 아이콘을 넣는 MUI 속성
              startIcon={
                // 여기가 아이콘 부분인데, '이미지 파일'이 아니라 'SVG 그림 코드'
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"  // SVG 내부 좌표 설정 (보통 아이콘에서 많이 쓰는 기본값)
                  fill="none" // 기본 채움색 없음
                  style={{ display: 'block', flexShrink: 0 }} // inline 요소 말고 block처럼 보이게 flex 안에서 아이콘이 줄어들지 않게 0
                >
                  {/* <path> : SVG의 실제 그림을 그리는 부분 */}
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    fill="#1877f2"  // 아이콘 색 (페이스북 파란색)
                  />
                </svg>
              }
              onClick={() => alert("'페이스북 로그인'은 구현 예정입니다.")}
              sx={{ //MUI(Material UI)에서 스타일을 주는 공식적인 방법
                mt: 1, //margin-top: theme.spacing(1) (보통 8px)
                color: '#385898',
                textTransform: 'none', //버튼에서 자동 대문자 변환을 끔
                fontWeight: 600, // 폰트 굵기
                '& .MuiButton-startIcon': { //버튼 내 아이콘과 텍스트 사이 간격 조절
                  marginRight: 1,
                },
              }}
              fullWidth
            >
              Facebook으로 로그인
            </Button>

            {/* //251130카카오로그인 관련3: 카카오 로그인 버튼 - Facebook 버튼 바로 아래에 표시 */}
            <Button
              variant="contained"
              onClick={() => {
                if (!window.Kakao || !window.Kakao.isInitialized()) {
                  alert('카카오 SDK가 초기화되지 않았습니다. 카카오 JavaScript 키를 확인해주세요.');
                  return;
                }

                // 카카오 로그인
                window.Kakao.Auth.login({
                  success: function (authObj) {
                    // 로그인 성공 시 액세스 토큰을 서버로 전송
                    fetch("http://localhost:3010/instauser/kakao/login", {
                      method: "POST",
                      headers: { "Content-type": "application/json" },
                      body: JSON.stringify({ accessToken: authObj.access_token }),
                    })
                      .then(res => res.json())
                      .then(data => {
                        if (data.result) {
                          localStorage.setItem("token", data.token);
                          alert(data.msg);
                          navigate("/instaHome");
                        } else {
                          alert(data.msg || "카카오 로그인에 실패했습니다.");
                        }
                      })
                      .catch(err => {
                        console.error(err);
                        alert("서버 통신 중 오류가 발생했습니다.");
                      });
                  },
                  fail: function (err) {
                    console.error("카카오 로그인 실패:", err);
                    alert("카카오 로그인에 실패했습니다.");
                  },
                });
              }}
              startIcon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ display: 'block', flexShrink: 0 }}
                >
                  <path
                    d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"
                    fill="#FEE500"
                  />
                  <path
                    d="M6.91 10.854c-.16 0-.324.008-.49.025l-.021-.004-.029.003c-1.189.12-2.218.68-2.9 1.537a.389.389 0 0 0-.12.258c-.018.15.09.285.239.315 1.826.457 3.375 1.313 4.52 2.457a.357.357 0 0 0 .472.05c1.04-.695 1.811-1.63 2.225-2.728.392-1.032.34-2.165-.15-3.197a.35.35 0 0 0-.26-.2c-.9-.18-1.9-.278-2.916-.278v.001zm10.18 0c-.16 0-.324.008-.49.025l-.021-.004-.028.003c-1.19.12-2.22.68-2.9 1.537a.388.388 0 0 0-.12.258c-.018.15.09.285.24.315 1.825.457 3.374 1.313 4.52 2.457a.357.357 0 0 0 .472.05c1.04-.695 1.81-1.63 2.225-2.728.392-1.032.34-2.165-.15-3.197a.35.35 0 0 0-.26-.2c-.9-.18-1.9-.278-2.916-.278v.001z"
                    fill="#000000"
                  />
                </svg>
              }
              sx={{
                mt: 1,
                mb: 1,
                backgroundColor: '#FEE500',
                color: '#000000',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { 
                  backgroundColor: '#FDD835',
                },
                '& .MuiButton-startIcon': {
                  marginRight: 1,
                },
              }}
              fullWidth
            >
              카카오톡으로 로그인
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              <MuiLink component={Link} to="/instafindpassword" underline="none">
                비밀번호를 잊으셨나요?
              </MuiLink>
            </Typography>
          </Paper>

          {/* Signup card */}
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2">
              계정이 없으신가요?{' '}
              <Link
                to="/instajoin"
                style={{
                  textDecoration: 'none',
                  color: '#385898',
                  fontWeight: 'bold',     // 글자 굵게
                }}
                // onMouseEnter={(e) => {
                //   e.target.style.textDecoration = 'underline'; // hover 시 밑줄
                // }}
                // onMouseLeave={(e) => {
                //   e.target.style.textDecoration = 'none'; // hover 벗어나면 원래대로
                // }}
              >
                회원가입
              </Link>
              {/* <MuiLink component={Link} to="/instajoin" underline="hover">
                회원가입
              </MuiLink> */}
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

export default InstaLogin;
