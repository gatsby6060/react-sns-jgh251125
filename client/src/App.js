import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import Login2 from './components/Login2';
import Mui from './components/Mui';

//새로 추가하는건 모두 Insta로 붙임
import InstaLogin from './components/InstaLogin';
import InstaJoin from './components/InstaJoin';
import InstaHome from './components/InstaHome';
import InstaMenu from './components/InstaMenu';
import InstaRegister from './components/InstraRegister';
import InstaProfile from './components/InstaProfile';
import InstaExplore from './components/InstaExplore'; 

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join' || location.pathname === '/instalogin' || location.pathname === '/instajoin';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <InstaMenu />} {/* 로그인과 회원가입 페이지가 아닐 때는 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login2" element={<Login2 />} />
          <Route path="/mui" element={<Mui />} />

          <Route path="/instalogin" element={<InstaLogin />} />
          <Route path="/instajoin" element={<InstaJoin />} />
          <Route path="/instahome" element={<InstaHome />} />
          <Route path="/instaregister" element={<InstaRegister />} />
          <Route path="/instaprofile" element={<InstaProfile />} />
          <Route path="/explore" element={<InstaExplore />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
