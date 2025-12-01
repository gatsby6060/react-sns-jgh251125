// src/pages/FindPassword.js
import React, { useRef, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function FindPassword() {
  const inputRef = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSend = () => {
    const value = inputRef.current?.value?.trim();
    if (!value) {
      alert('이메일 또는 아이디를 입력하세요.');
      return;
    }

    if (value.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      alert('유효한 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    const param = { emailOrId: value };
    console.log('find-password 요청 파라미터:', param);

    fetch('http://localhost:3010/instauser/find-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(param),
    })
      .then(async (res) => {
        const text = await res.text();
        // 서버 오류(HTML 등)인지 체크
        if (!res.ok) {
          console.error('서버 오류 응답:', res.status, text);
          // 가능한 경우 JSON으로 파싱해서 msg 뽑아내기 시도
          try {
            const parsed = JSON.parse(text);
            alert(parsed.msg || `서버 에러: ${res.status}`);
          } catch (e) {
            alert(`서버 에러: ${res.status}. 콘솔을 확인하세요.`);
          }
          throw new Error('Server returned non-OK');
        }

        // 정상 응답이면 JSON 파싱 시도
        try {
          const data = JSON.parse(text);
          return data;
        } catch (e) {
          console.error('JSON 파싱 실패:', text);
          alert('서버 응답이 올바른 형식이 아닙니다. 콘솔 확인');
          throw e;
        }
      })
      .then((data) => {
        console.log('find-password response', data);
        alert(data?.msg ?? '요청이 전송되었습니다. 메일을 확인하세요.');

        // 개발 편의: 서버가 resetUrl을 반환하면 콘솔에 찍고 클립보드에 복사 시도
        if (data?.resetUrl) {
          console.log('resetUrl:', data.resetUrl);
          // 클립보드 복사 (사용자 클릭 이벤트 안에서 실행되므로 대부분 동작)
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(data.resetUrl)
              .then(() => {
                alert('재설정 링크가 클립보드에 복사되었습니다. (개발용)');
              })
              .catch((err) => {
                console.warn('클립보드 복사 실패', err);
                // fallback: 새 탭으로 열기 (개발 환경에서만)
                try {
                  window.open(data.resetUrl, '_blank');
                } catch (e) {
                  console.warn('새 탭 열기 실패', e);
                }
              });
          } else {
            // 클립보드 API 없으면 새 탭으로 열기 시도
            try {
              window.open(data.resetUrl, '_blank');
              alert('재설정 링크가 새 탭으로 열렸습니다. (개발용)');
            } catch (e) {
              console.warn('새 탭 열기 실패', e);
              alert('재설정 링크: ' + data.resetUrl);
            }
          }
        }

        // 성공 플로우: result가 true이면 로그인 화면으로 이동
        if (data?.result) {
          navigate('/instalogin');
        }
      })
      .catch((err) => {
        // 이미 위에서 알림을 띄웠을 수 있음 — 그래도 콘솔로 에러 확인
        console.error('find-password 처리 중 에러:', err);
        // 사용자에게 네트워크/서버 에러 안내
        if (!err.message.includes('Server returned non-OK')) {
          alert('서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom>
          비밀번호 찾기
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
          가입하실 때 사용한 이메일 또는 아이디를 입력하세요. 메일로 재설정 링크를 보내드립니다.
        </Typography>

        <TextField
          inputRef={inputRef}
          label="이메일 또는 아이디"
          variant="outlined"
          margin="normal"
          fullWidth
          autoFocus
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '16px' }}
          onClick={onSend}
          disabled={loading}
        >
          {loading ? '전송중...' : '전송'}
        </Button>

        <Typography variant="body2" style={{ marginTop: '12px' }}>
          로그인하러 가기 ? <Link to="/">로그인</Link>
        </Typography>

        <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
          문제가 있으면 관리자에게 문의하세요.
        </Typography>
      </Box>
    </Container>
  );
}

export default FindPassword;
