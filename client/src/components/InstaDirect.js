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
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
  Badge,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import { jwtDecode } from 'jwt-decode';

function InstaDirect() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // URL 정규화 함수
  const normalizeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:3010${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 채팅방 목록 가져오기
  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3010/instamessage/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.result === 'success') {
        // 프로필 이미지 URL 정규화
        const normalizedRooms = data.rooms.map(room => ({
          ...room,
          OTHER_PROFILE_IMG: normalizeUrl(room.OTHER_PROFILE_IMG)
        }));
        setRooms(normalizedRooms);
      }
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
    }
  };

  // 메시지 가져오기
  const fetchMessages = async (roomId) => {
    if (!roomId) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3010/instamessage/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.result === 'success') {
        // 프로필 이미지 URL 정규화
        const normalizedMessages = data.messages.map(msg => ({
          ...msg,
          SENDER_PROFILE_IMG: normalizeUrl(msg.SENDER_PROFILE_IMG)
        }));
        setMessages(normalizedMessages);
        // 메시지 목록 업데이트 후 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch(`http://localhost:3010/instamessage/rooms/${selectedRoom.ROOM_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: messageContent,
          messageType: 'TEXT'
        })
      });
      const data = await res.json();
      if (data.result === 'success') {
        // 새 메시지를 목록에 추가
        const normalizedMsg = {
          ...data.message,
          SENDER_PROFILE_IMG: normalizeUrl(data.message.SENDER_PROFILE_IMG)
        };
        setMessages([...messages, normalizedMsg]);
        // 채팅방 목록 새로고침
        fetchRooms();
        // 스크롤
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    }
  };

  // 사용자 검색
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3010/instamessage/search/users?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.result === 'success') {
        const normalizedUsers = data.users.map(user => ({
          ...user,
          PROFILE_IMG: normalizeUrl(user.PROFILE_IMG)
        }));
        setSearchResults(normalizedUsers);
      }
    } catch (error) {
      console.error('사용자 검색 실패:', error);
    }
  };

  // 새 채팅방 생성 또는 기존 채팅방 열기
  const startChat = async (otherUserId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3010/instamessage/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otherUserId })
      });
      const data = await res.json();
      if (data.result === 'success') {
        const normalizedRoom = {
          ...data.room,
          OTHER_PROFILE_IMG: normalizeUrl(data.room.OTHER_PROFILE_IMG)
        };
        setSelectedRoom(normalizedRoom);
        setSearchQuery('');
        setSearchResults([]);
        fetchMessages(normalizedRoom.ROOM_ID);
        fetchRooms();
      }
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방을 생성하는 중 오류가 발생했습니다.');
    }
  };

  // 채팅방 선택
  const selectRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room.ROOM_ID);
  };

  // 스크롤을 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 포맷팅 (시간)
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 초기화
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      window.location.href = '/instalogin';
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.userId);
      fetchRooms();
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
    }
  }, []);

  // 메시지 입력창에서 Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 검색어 변경 시 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        bgcolor: '#fafafa',
      }}
    >
      {/* 왼쪽 사이드바 - 채팅방 목록 */}
      <Paper
        elevation={0}
        sx={{
          width: 350,
          borderRight: '1px solid #dbdbdb',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fff',
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #dbdbdb',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            메시지
          </Typography>
        </Box>

        {/* 검색창 */}
        <Box sx={{ p: 2, borderBottom: '1px solid #dbdbdb' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="검색"
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
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#dbdbdb',
                },
              },
            }}
          />
        </Box>

        {/* 검색 결과 또는 채팅방 목록 */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {searchQuery ? (
            // 검색 결과
            <List>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <ListItem
                    key={user.USER_ID}
                    button
                    onClick={() => startChat(user.USER_ID)}
                    sx={{
                      '&:hover': { bgcolor: '#fafafa' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.PROFILE_IMG}
                        alt={user.USERNAME}
                        sx={{ width: 56, height: 56 }}
                      >
                        {user.USERNAME?.charAt(0)?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.USERNAME}
                      secondary={user.USER_ID}
                    />
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    검색 결과가 없습니다.
                  </Typography>
                </Box>
              )}
            </List>
          ) : (
            // 채팅방 목록
            <List>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <ListItem
                    key={room.ROOM_ID}
                    button
                    selected={selectedRoom?.ROOM_ID === room.ROOM_ID}
                    onClick={() => selectRoom(room)}
                    sx={{
                      '&:hover': { bgcolor: '#fafafa' },
                      '&.Mui-selected': { bgcolor: '#f0f0f0' },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={room.UNREAD_COUNT > 0 ? room.UNREAD_COUNT : null}
                        color="primary"
                        invisible={room.UNREAD_COUNT === 0}
                      >
                        <Avatar
                          src={room.OTHER_PROFILE_IMG}
                          alt={room.OTHER_USERNAME}
                          sx={{ width: 56, height: 56 }}
                        >
                          {room.OTHER_USERNAME?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.OTHER_USERNAME}
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {room.LAST_MESSAGE || '메시지 없음'}
                          </Typography>
                          {room.LAST_MESSAGE_TIME && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                            >
                              {formatTime(room.LAST_MESSAGE_TIME)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    메시지가 없습니다.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    검색하여 사용자와 대화를 시작하세요.
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>
      </Paper>

      {/* 오른쪽 메시지 영역 */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
        {selectedRoom ? (
          <>
            {/* 채팅방 헤더 */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #dbdbdb',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Avatar
                src={selectedRoom.OTHER_PROFILE_IMG}
                alt={selectedRoom.OTHER_USERNAME}
                sx={{ width: 40, height: 40, mr: 2 }}
              >
                {selectedRoom.OTHER_USERNAME?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedRoom.OTHER_USERNAME}
              </Typography>
            </Box>

            {/* 메시지 목록 */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#fafafa',
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {messages.map((message) => {
                    const isOwn = message.SENDER_ID === currentUserId;
                    return (
                      <Box
                        key={message.MESSAGE_ID}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        {!isOwn && (
                          <Avatar
                            src={message.SENDER_PROFILE_IMG}
                            alt={message.SENDER_USERNAME}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {message.SENDER_USERNAME?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        )}
                        <Box
                          sx={{
                            maxWidth: '60%',
                            bgcolor: isOwn ? '#0095f6' : '#fff',
                            color: isOwn ? '#fff' : '#000',
                            borderRadius: '18px',
                            px: 2,
                            py: 1,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {message.CONTENT}
                          </Typography>
                          {message.MEDIA_URL && (
                            <Box sx={{ mt: 1 }}>
                              <img
                                src={normalizeUrl(message.MEDIA_URL)}
                                alt="메시지 이미지"
                                style={{ maxWidth: '100%', borderRadius: '8px' }}
                              />
                            </Box>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                              fontSize: '0.7rem',
                            }}
                          >
                            {formatTime(message.CREATED_AT)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* 메시지 입력창 */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #dbdbdb',
                bgcolor: '#fff',
              }}
            >
              <TextField
                inputRef={messageInputRef}
                fullWidth
                placeholder="메시지 입력..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        color="primary"
                        sx={{ color: '#0095f6' }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    '& fieldset': {
                      borderColor: '#dbdbdb',
                    },
                  },
                }}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              메시지를 선택하세요
            </Typography>
            <Typography variant="body2" color="text.secondary">
              왼쪽에서 대화를 선택하거나 검색하여 새 대화를 시작하세요.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default InstaDirect;


