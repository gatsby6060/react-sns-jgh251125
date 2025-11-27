import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon, Divider } from '@mui/material';
import { Home, Add, AccountCircle, Search, Explore, Send, FavoriteBorder, AddBoxOutlined, MoreHoriz } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Menu() {
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

        <ListItem button component={Link} to="/feed">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="피드" />
        </ListItem>
        {/* <ListItem button component={Link} to="/register">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="등록" />
        </ListItem> */}
        <ListItem button component={Link} to="/mypage">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem>
        <ListItem button component={Link} to="/login2">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="신형로그인페이지(test중)" />
        </ListItem>
        <ListItem button component={Link} to="/mui">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="MUI" />
        </ListItem>
        {/* --- 기존 메뉴 항목 끝 --- */}

        <Divider sx={{ my: 1 }} /> {/* 구분선 추가 */}
        
        {/* --- 새로 추가된 인스타그램 스타일 메뉴 시작 --- */}
        <Typography variant="subtitle2" component="div" sx={{ p: 2, fontWeight: 'bold', color: 'text.secondary' }}>
            {/* 임시 구분자 */}
            Insta Navigation
        </Typography>

        {/* 1. 검색 */}
        <ListItem button component={Link} to="/search">
          <ListItemIcon>
            <Search />
          </ListItemIcon>
          <ListItemText primary="검색" />
        </ListItem>

        {/* 2. 탐색 탭 */}
        <ListItem button component={Link} to="/explore">
          <ListItemIcon>
            <Explore />
          </ListItemIcon>
          <ListItemText primary="탐색 탭" />
        </ListItem>

        {/* 3. 메시지 */}
        <ListItem button component={Link} to="/direct">
          <ListItemIcon>
            <Send />
          </ListItemIcon>
          <ListItemText primary="메시지" />
        </ListItem>

        {/* 4. 알림 */}
        <ListItem button component={Link} to="/notifications">
          <ListItemIcon>
            <FavoriteBorder />
          </ListItemIcon>
          <ListItemText primary="알림" />
        </ListItem>



        {/* 6. 프로필 */}
        {/* 기존 '마이페이지'가 있으나, 별도 항목으로 추가 */}
        <ListItem button component={Link} to="/profile">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="프로필" />
        </ListItem>
        
        <Divider sx={{ my: 1 }} />

        {/* 7. 더 보기 (하단) */}
        <ListItem button component={Link} to="/more">
          <ListItemIcon>
            <MoreHoriz />
          </ListItemIcon>
          <ListItemText primary="더 보기" />
        </ListItem>
        {/* --- 새로 추가된 인스타그램 스타일 메뉴 끝 --- */}
        
      </List>
    </Drawer>
  );
};

export default Menu;