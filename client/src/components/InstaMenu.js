import React, { useEffect, useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon, Divider , Avatar } from '@mui/material';
import { Home, Add, AccountCircle, Search, Explore, Send, FavoriteBorder, AddBoxOutlined, MoreHoriz} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Menu() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // 로그인 안된 경우엔 기본 아이콘 유지

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (e) {
      console.warn('토큰 파싱 실패', e);
      return;
    }

    const userId = decoded.userId;
    if (!userId) return;
    
    // 사용자 정보 가져오기
    fetch(`http://localhost:3010/instauser/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          console.warn('사용자 정보 없음', data);
        }
      })
      .catch(err => {
        console.error('사용자 정보 로드 실패', err);
      });
  }, []);


  const profileLink = user ? '/instaprofile' : '/instalogin';
///instaprofile/:userId 면 `${'/instaprofile/' + user.USER_ID}`

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240, // 너비 설정
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240, // Drawer 내부의 너비 설정
          boxSizing: 'border-box',
          // 인스타그램 사이드바 디자인과 유사하게 조정
          borderRight: '1px solid #dbdbdb',
        },
      }}
    >
      <Toolbar />
      {/* Instagram 로고/제목 부분 */}
      <Typography
        variant="h5"
        component="div"
        sx={{ p: 2, fontWeight: 'bold' }} // 글씨 굵게
      >
        Instagram
      </Typography>

      <List>
        {/* --- 기존 메뉴 항목 시작 (참고용) --- */}
        <ListItem button component={Link} to="/instahome">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="홈" />
        </ListItem>

        {/* 5. 만들기 */}
        <ListItem button component={Link} to="/instaregister">
          <ListItemIcon>
            <AddBoxOutlined />
          </ListItemIcon>
          <ListItemText primary="만들기" />
        </ListItem>

        {/* <ListItem button component={Link} to="/feed">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="피드" />
        </ListItem> */}
        {/* <ListItem button component={Link} to="/register">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="등록" />
        </ListItem> */}
        {/* <ListItem button component={Link} to="/mypage">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem> */}
        {/* <ListItem button component={Link} to="/login2">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="신형로그인페이지(test중)" />
        </ListItem> */}
        {/* <ListItem button component={Link} to="/mui">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="MUI" />
        </ListItem> */}
        {/* --- 기존 메뉴 항목 끝 --- */}

        {/* <Divider sx={{ my: 1 }} /> 구분선 추가 */}

        {/* --- 새로 추가된 인스타그램 스타일 메뉴 시작 --- */}
        {/* <Typography variant="subtitle2" component="div" sx={{ p: 2, fontWeight: 'bold', color: 'text.secondary' }}>
            {/* 임시 구분자 */}
        {/* Insta Navigation */}
        {/* </Typography>  */}

        {/* 1. 검색 */}
        <ListItem button component={Link} to="/instasearch">
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="검색" />
        </ListItem>

        {/* 2. 탐색 탭 */}
        <ListItem button component={Link} to="/instaexplore">
          <ListItemIcon>
            <Explore />
          </ListItemIcon>
          <ListItemText primary="탐색 탭" />
        </ListItem>

        {/* 3. 메시지 */}
        <ListItem button component={Link} to="/instadirect">
          <ListItemIcon>
            <Send />
          </ListItemIcon>
          <ListItemText primary="메시지" />
        </ListItem>

        {/* 4. 알림 */}
        <ListItem button component={Link} to="/instanotifications">
          <ListItemIcon>
            <FavoriteBorder />
          </ListItemIcon>
          <ListItemText primary="알림" />
        </ListItem>



        {/* 6. 프로필 */}
        {/* <ListItem button component={Link} to="/instaprofile">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="프로필" />
        </ListItem>

        <Divider sx={{ my: 1 }} /> */}
        {/* 프로필: 실제 사용자 아바타 노출 */}
        <ListItem button component={Link} to={profileLink}>
          <ListItemIcon>
            {user && user.PROFILE_IMG ? (
              <Avatar
                src={user.PROFILE_IMG}
                alt={user.USERNAME || user.USER_ID}
                sx={{ width: 32, height: 32, border: '1px solid #ddd' }}
              />
            ) : user && user.USERNAME ? (
              // 이미지 없으면 이름 첫글자
              <Avatar sx={{ width: 32, height: 32, border: '1px solid #ddd' }}>
                {user.USERNAME.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              // 로그인 안된 경우나 user 정보 없을 때 회색 기본 아바타
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#bdbdbd' }} />
            )}
          </ListItemIcon>
          <ListItemText primary="프로필" />
        </ListItem>

        {/* 7. 더 보기 (하단) */}
        {/* <ListItem button component={Link} to="/more">
          <ListItemIcon>
            <MoreHoriz />
          </ListItemIcon>
          <ListItemText primary="더 보기" />
        </ListItem> */}
        {/* --- 새로 추가된 인스타그램 스타일 메뉴 끝 --- */}

      </List>
    </Drawer>
  );
};

export default Menu;