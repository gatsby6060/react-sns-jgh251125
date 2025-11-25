import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let navigate = useNavigate();
  let userId = useRef(); //useRef는 DOM을 잡거나, 리렌더 없이 값을 유지할 때 사용 (그냥 let방식은 리렌더시 완전히 초기화됨)
  let pwd = useRef(); //리렌더 없이 화면 유지할 때 사용 
  let userName = useRef();

  // function fnMemberJoin() {

  //   // alert("회원가입 버튼 눌림");
  //   // alert(idRef.current.value);
  //   // alert(pwRef.current.value);
  //   // alert(nmRef.current.value);


  //   let param = {
  //     idRef: idRef.current.value,
  //     pwRef: pwRef.current.value,
  //     nmRef: nmRef.current.value,
  //   }
  //   // alert("param 확인 " + JSON.stringify(param));
  //   //테이블에 저장
  //   fetch("http://localhost:3010/user/", {
  //     method: "POST",
  //     headers: { "Content-type": "application/json" }, //headers임!
  //     body: JSON.stringify(param),
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       alert("회원이 저장되었습니다.");
  //       // location.href = "product-list.html";
  //       // navigate("/");
  //     })

  // }

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
          회원가입
        </Typography>

        <TextField inputRef={userId} label="ID" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={pwd}
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <TextField inputRef={userName} label="Username" variant="outlined" margin="normal" fullWidth />

        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}
          onClick={() => {
            let param = {
              userId: userId.current.value,
              pwd: pwd.current.value,
              userName: userName.current.value
            };
            fetch("http://localhost:3010/user/join", {
              method: "POST",
              headers: { "Content-type": "application/json" }, //headers임!
              body: JSON.stringify(param),
            })
              .then(res => res.json())
              .then(data => {
                console.log(data);
                alert(data.msg);
                navigate("/");
              })
          }}
        >
          회원가입
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/login">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;