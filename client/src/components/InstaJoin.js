// Join.js
import React, { useRef, useState } from 'react';
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

function InstaJoin() {
  let navigate = useNavigate();
  
  // 실시간 검증을 위한 state
  const [userName, setUserName] = useState('');
  const [emailorphone, setEmailorphone] = useState('');
  const [pwd, setPwd] = useState('');
  const [fullName, setFullName] = useState('');
  
  // 에러 메시지 state
  const [userNameError, setUserNameError] = useState('');
  const [emailorphoneError, setEmailorphoneError] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  
  // 중복 체크 중인지 표시
  const [checkingUserName, setCheckingUserName] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // 사용자 이름 중복 체크
  function checkUserName(value) {
    if (!value || value.trim() === '') {
      setUserNameError('');
      return;
    }
    
    setCheckingUserName(true);
    fetch("http://localhost:3010/instauser/check/username/" + value)
      .then(res => res.json())
      .then(data => {
        if (data.isDuplicate) {
          setUserNameError('이미 사용 중인 사용자 이름입니다.');
        } else {
          setUserNameError('');
        }
        setCheckingUserName(false);
      })
      .catch(err => {
        console.error('중복 체크 중 에러:', err);
        setCheckingUserName(false);
      });
  }

  // 이메일/휴대폰 중복 체크
  function checkEmailorphone(value) {
    if (!value || value.trim() === '') {
      setEmailorphoneError('');
      return;
    }
    
    setCheckingEmail(true);
    fetch("http://localhost:3010/instauser/check/email/" + value)
      .then(res => res.json())
      .then(data => {
        if (data.isDuplicate) {
          setEmailorphoneError('이미 사용 중인 이메일 또는 휴대폰 번호입니다.');
        } else {
          setEmailorphoneError('');
        }
        setCheckingEmail(false);
      })
      .catch(err => {
        console.error('중복 체크 중 에러:', err);
        setCheckingEmail(false);
      });
  }

  // 비밀번호 정규식 검증
  function validatePassword(value) {
    if (!value) {
      setPwdError('');
      return;
    }
    
    // 비밀번호 정규식: 최소 8자, 영문, 숫자, 특수문자 포함
    let passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    
    if (value.length < 8) {
      setPwdError('비밀번호는 최소 8자 이상이어야 합니다.');
    } else if (!passwordRegex.test(value)) {
      setPwdError('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.');
    } else {
      setPwdError('');
    }
  }

  function fnJoin() {
    // 최종 검증
    if (userNameError || emailorphoneError || pwdError || fullNameError) {
      alert('입력 정보를 확인해주세요.');
      return;
    }
    
    if (!userName || !emailorphone || !pwd || !fullName) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    let param = {
      userId: userName,
      pwd: pwd,
      userName: fullName,
      emailorphone: emailorphone
    };

    fetch("http://localhost:3010/instauser/join", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(param),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        alert(data.msg);
        if (data.result) {
          navigate("/instalogin");
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
        px: 2,
      }}
    >
      {/* 중앙 회원가입 폼 */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 350,
          textAlign: 'center',
          my: 4,
        }}
      >
          {/* Instagram 로고 */}
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

          {/* 회원가입 카드 */}
          <Paper elevation={1} sx={{ p: 4, mb: 2, bgcolor: 'white' }}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontWeight: 600 }}>
              친구들의 사진과 동영상을 보려면 가입하세요.
            </Typography>

            {/* Facebook으로 로그인 버튼 (맨 위) */}
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
                mb: 2,
                backgroundColor: '#1877f2',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#166fe5' },
                '& .MuiButton-startIcon': {
                  marginRight: 1,
                },
              }}
              fullWidth
            >
              Facebook으로 로그인
            </Button>

            {/* 구분선 */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" sx={{ mx: 1, color: 'text.secondary' }}>
                또는
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* 입력 필드들 */}
            <TextField
              label="휴대폰 번호 또는 이메일 주소"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
              value={emailorphone}
              onChange={(e) => {
                setEmailorphone(e.target.value);
                checkEmailorphone(e.target.value);
              }}
              error={!!emailorphoneError}
              helperText={emailorphoneError || (checkingEmail ? '확인 중...' : '')}
              sx={{ mb: 1 }}
            />
            <TextField
              label="성명"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (!e.target.value || e.target.value.trim() === '') {
                  setFullNameError('성명을 입력해주세요.');
                } else {
                  setFullNameError('');
                }
              }}
              error={!!fullNameError}
              helperText={fullNameError}
              sx={{ mb: 1 }}
            />
            <TextField
              label="사용자 이름"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                checkUserName(e.target.value);
              }}
              error={!!userNameError}
              helperText={userNameError || (checkingUserName ? '확인 중...' : '')}
              sx={{ mb: 1 }}
            />
            <TextField
              label="비밀번호"
              variant="outlined"
              margin="dense"
              fullWidth
              size="small"
              type="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                validatePassword(e.target.value);
              }}
              error={!!pwdError}
              helperText={pwdError || '영문, 숫자, 특수문자를 포함하여 최소 8자 이상'}
              sx={{ mb: 2 }}
            />

            {/* 정보 텍스트 */}
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 2, textAlign: 'left' }}>
              저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.{' '}
              <MuiLink href="#" underline="hover" sx={{ color: '#385898' }}>
                더 알아보기
              </MuiLink>
            </Typography>

            {/* 가입 버튼 (보라색) */}
            <Button
              fullWidth
              variant="contained"
              onClick={fnJoin}
              sx={{
                mb: 2,
                backgroundColor: '#8e44ad',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#7d3c98' },
              }}
            >
              가입
            </Button>

            {/* 약관 안내 */}
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', textAlign: 'center' }}>
              가입하면 Instagram의 약관, 데이터 정책 및 쿠키 정책에 동의하게 됩니다.
            </Typography>
          </Paper>

          {/* 로그인 안내 카드 */}
          <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2">
              계정이 있으신가요?{' '}
              <MuiLink component={Link} to="/instalogin" underline="hover">
                로그인
              </MuiLink>
            </Typography>
          </Paper>

          {/* Footer */}
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
  );
}

export default InstaJoin;

