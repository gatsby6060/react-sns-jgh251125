// InstaSearch.js (수정된 전체 파일)
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function InstaSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimer = useRef(null);
  const navigate = useNavigate();

  // 서버 사용자 검색 엔드포인트 (필요시 변경)
  const SEARCH_USERS_URL = (q) => `http://localhost:3010/instauser/search?q=${encodeURIComponent(q)}`;

  // URL 정규화 (상대/절대 경로 처리)
  const normalizeUrl = (url) => {
    if (!url) return null;
    // 이미 완전한 URL이면 그대로
    if (/^https?:\/\//i.test(url)) return url;
    // 만약 서버에서 '/uploads/...' 같은 상대 경로를 줬다면 host 붙이기
    const trimmed = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:3010${trimmed}`;
  };

  // 초기화: 토큰에서 현재 사용자 id 추출 (다양한 필드명 허용)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const id = decoded?.userId || decoded?.USER_ID || decoded?.id || decoded?.sub;
      if (id) setCurrentUserId(id);
    } catch (err) {
      console.error('토큰 디코딩 실패', err);
    }
  }, []);

  // 검색어 변경 시 debounced 검색
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      searchUsersByIntro(searchQuery.trim());
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  // intro 필드 기반 사용자 검색 (응답 구조에 강인하게 대응)

  const searchUsersByIntro = (query) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('검색 불가: 토큰 없음');
      return;
    }
    console.log("호출직전 확인1 " + encodeURIComponent(query));
    console.log("호출직전 확인2 " + query);
    setLoading(true);

    //  호출
    fetch(`http://localhost:3010/instauser/search?q=${(query)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        // 가능한 응답 형태들을 안전하게 배열로 추출
        let users = [];
        if (Array.isArray(data?.users)) users = data.users;
        else if (Array.isArray(data?.rows)) users = data.rows;
        else if (Array.isArray(data?.data)) users = data.data;
        else if (Array.isArray(data)) users = data;
        else if (Array.isArray(data?.result)) users = data.result;
        else users = [];

        // 최종 안전 체크
        if (!Array.isArray(users)) users = [];

        const normalized = users.map(u => {
          // normalize keys if backend uses lowercase keys
          const PROFILE_IMG = u.PROFILE_IMG || u.profile_img || u.profileImg || u.profile || null;
          const intro = u.intro || u.INTRO || u.description || '';
          const USERNAME = u.USERNAME || u.username || u.name || '';
          const USER_ID = u.USER_ID || u.userId || u.id || '';

          return {
            ...u,
            PROFILE_IMG: normalizeUrl(PROFILE_IMG),
            intro,
            introPreview: intro ? (intro.length > 120 ? intro.slice(0, 120) + '...' : intro) : '',
            USERNAME,
            USER_ID,
          };
        });

        setSearchResults(normalized);
      })
      .catch(error => {
        console.error('사용자 검색 실패:', error);
        alert('서버 통신 중 오류가 발생했습니다.');
        setSearchResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectUser = (user) => {
    setSelectedUser({
      ...user,
      PROFILE_IMG: normalizeUrl(user.PROFILE_IMG),
    });
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#fafafa' }}>
      {/* 좌측: 검색 + 결과 */}
      <Paper sx={{ width: 360, borderRight: '1px solid #dbdbdb', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }} elevation={0}>
        <Box sx={{ p: 2, borderBottom: '1px solid #dbdbdb' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>사용자 검색</Typography>
        </Box>

        <Box sx={{ p: 2, borderBottom: '1px solid #dbdbdb' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="소개글(intro) 또는 사용자명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: '#fafafa',
              '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#dbdbdb' } },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {searchResults.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    검색 결과가 없습니다.
                  </Typography>
                </Box>
              ) : (
                searchResults.map((user) => {
                  const key = user.USER_ID || user.userId || user.id || user.USERNAME || Math.random().toString(36).slice(2);
                  return (
                    <React.Fragment key={key}>
                      <ListItem
                        button
                        onClick={() => handleSelectUser(user)}
                        sx={{ alignItems: 'flex-start', '&:hover': { bgcolor: '#fafafa' } }}
                      >
                        <ListItemAvatar>
                          <Avatar src={user.PROFILE_IMG} alt={user.USERNAME} sx={{ width: 56, height: 56 }}>
                            {user.USERNAME?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {user.USERNAME || '이름 없음'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {user.USER_ID || ''}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {user.introPreview || '소개글이 없습니다.'}
                            </Typography>
                          }
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              )}
            </List>
          )}
        </Box>
      </Paper>

      {/* 우측: 선택한 사용자 상세 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
        {selectedUser ? (
          <>
            <Box sx={{ p: 3, borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* 클릭 가능한 Avatar */}
              <Avatar
                src={selectedUser.PROFILE_IMG}
                sx={{ width: 64, height: 64, cursor: 'pointer' }}
                onClick={() => {
                  const userId = selectedUser.USER_ID || selectedUser.userId || selectedUser.id;
                  if (!userId) return;
                  // 선택: 안전하게 인코딩하려면 아래처럼 encodeURIComponent 사용
                  // navigate(`/profile/${encodeURIComponent(userId)}`);
                  // 대부분의 경우는 인코딩 없이 사용해도 됩니다~~~ 편하게 갑시당
                  navigate(`/profile/${userId}`);
                }}
                alt={selectedUser.USERNAME || selectedUser.USER_ID}
              >
                {selectedUser.USERNAME?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedUser.USERNAME || '작성자'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedUser.USER_ID || ''}
                </Typography>
              </Box>
              {String(selectedUser.USER_ID || selectedUser.userId) === String(currentUserId) && (
                <Button variant="outlined" size="small">프로필 편집</Button>
              )}
            </Box>

            {/* ...나머지 내용 그대로 */}
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>사용자를 선택하세요</Typography>
            <Typography variant="body2" color="text.secondary">좌측에서 검색 결과를 선택하면 프로필 소개글을 확인할 수 있습니다.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default InstaSearch;
