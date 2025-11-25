import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, Navigate, useNavigate } from 'react-router-dom';

function Login() {
  let userId = useRef(); // 값을 꺼낼때 그냥 let쓰면 문법이 리엑트문법과 다르게 뽑아내게됨
  let pwd = useRef();    // 이럴때는 Ref로 리액트 구조대로 함
  let navigate = useNavigate();

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
          로그인
        </Typography>
        <TextField inputRef={userId} label="id" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={pwd}
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}
          onClick={() => {
            let param = {
              userId: userId.current.value,
              pwd: pwd.current.value,
            };
            fetch("http://localhost:3010/user/login", {
              method: "POST",
              headers: { "Content-type": "application/json" }, //headers임!
              body: JSON.stringify(param),
            })
              .then(res => res.json())
              .then(data => {
                console.log(data);
                alert(data.msg);
                if (data.result) {
                  localStorage.setItem("token" , data.token);
                  //화면을 부드럽게 옮길수 있음 리엑트 장점 (안깜박임)
                  navigate("/feed");

                  //만약 아래처럼 하면 화면 화면이 깜박임
                  //location.href = "/feed";
                }
              })
          }}
        >
          로그인
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          회원아니셈 ? <Link to="/join">회원가입</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
