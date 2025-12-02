import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Avatar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function InstaEditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState({ USERNAME: '', INTRO: '' });
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 필요");
      navigate("/instalogin");
      return;
    }
    const decoded = jwtDecode(token);
    fetch(`http://localhost:3010/instauser/user/${decoded.userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setEditUser({ USERNAME: data.user.USERNAME || '', INTRO: data.user.INTRO || '' });
      });
  }, []);

  const handleSave = () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    fetch(`http://localhost:3010/instauser/${decoded.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editUser)
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === 'success') {
          alert("프로필이 수정되었습니다.");
          navigate(-1); // 이전 페이지로 이동
        } else {
          alert("수정 실패");
        }
      });
  };

  if (!user) return <Typography>로딩 중...</Typography>;

  return (
    <Box sx={{ maxWidth: '500px', mx: 'auto', mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">프로필 편집</Typography>
      <Avatar src={user.PROFILE_IMG} sx={{ width: 120, height: 120, mx: 'auto' }} />
      <Button variant="contained" component="label">
        사진 업로드
        <input
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // 기존 handleProfileUpload 재사용 가능
            }
          }}
        />
      </Button>
      <TextField
        label="사용자 이름"
        value={editUser.USERNAME}
        onChange={(e) => setEditUser({...editUser, USERNAME: e.target.value})}
        fullWidth
      />
      <TextField
        label="소개"
        value={editUser.INTRO}
        onChange={(e) => setEditUser({...editUser, INTRO: e.target.value})}
        fullWidth
        multiline
        rows={3}
      />
      <Button variant="contained" onClick={handleSave}>저장</Button>
    </Box>
  );
}

export default InstaEditProfile;
