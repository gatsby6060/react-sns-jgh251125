# Instagram 스타일 SNS 프로젝트

Instagram을 모티브로 한 소셜 네트워크 서비스(SNS) 웹 애플리케이션입니다.

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [API 엔드포인트](#api-엔드포인트)
- [주요 화면](#주요-화면)

## 🎯 프로젝트 소개

이 프로젝트는 Instagram의 UI/UX를 참고하여 개발된 SNS 웹 애플리케이션입니다. 사용자들은 게시물을 업로드하고, 다른 사용자들과 소통하며, 피드를 탐색할 수 있습니다.

## ✨ 주요 기능

### 인증 및 사용자 관리
- ✅ 일반 로그인/회원가입
- ✅ 카카오 소셜 로그인
- ✅ 비밀번호 찾기/재설정
- ✅ 프로필 편집 및 프로필 사진 업로드

### 피드 기능
- ✅ 게시물 업로드 (이미지/동영상)
- ✅ 피드 조회 및 탐색
- ✅ 좋아요 기능
- ✅ 댓글 작성 및 조회
- ✅ 게시물 삭제

### 소셜 기능
- ✅ 사용자 검색
- ✅ 프로필 페이지 조회
- ✅ 다른 사용자 프로필 탐색
- ✅ 실시간 메시지 (DM)

### UI/UX
- ✅ 반응형 디자인 (Material-UI)
- ✅ Instagram 스타일 UI
- ✅ 이미지/동영상 미리보기
- ✅ 모달을 통한 상세보기

## 🛠 기술 스택

### Frontend
- **React** 18.3.1
- **Material-UI (MUI)** 6.1.5
- **React Router** 6.27.0
- **JWT Decode** 4.0.0

### Backend
- **Node.js** (Express 5.1.0)
- **MySQL** (mysql2 3.15.3)
- **JWT** (jsonwebtoken 9.0.2)
- **Multer** 2.0.2 (파일 업로드)
- **Bcrypt** 6.0.0 (비밀번호 암호화)
- **Nodemailer** 7.0.11 (이메일 발송)

## 📁 프로젝트 구조

```
react-sns-jgh251125/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── InstaLogin.js
│   │   │   ├── InstaJoin.js
│   │   │   ├── InstaHome.js
│   │   │   ├── InstaProfile.js
│   │   │   ├── InstaSearch.js
│   │   │   ├── InstaExplore.js
│   │   │   ├── InstaDirect.js
│   │   │   └── ...
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                 # Express 백엔드
│   ├── routes/            # API 라우트
│   │   ├── insta_user.js
│   │   ├── insta_home.js
│   │   ├── insta_feed.js
│   │   ├── insta_comment.js
│   │   └── insta_message.js
│   ├── server.js
│   ├── auth.js            # JWT 인증 미들웨어
│   ├── db.js              # 데이터베이스 연결
│   └── uploads/           # 업로드된 파일 저장소
│
└── README.md
```

## 🚀 시작하기

### 필수 요구사항
- Node.js (v14 이상)
- MySQL
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd react-sns-jgh251125
```

2. **백엔드 설정**
```bash
cd server
npm install
```

3. **데이터베이스 설정**
- MySQL 데이터베이스 생성
- `초기생성테이블.sql` 파일 실행하여 테이블 생성
- `.env` 파일 생성 및 데이터베이스 연결 정보 설정

4. **백엔드 서버 실행**
```bash
cd server
node server.js
# 또는
nodemon server.js
```
서버는 `http://localhost:3010`에서 실행됩니다.

5. **프론트엔드 설정**
```bash
cd client
npm install
```

6. **프론트엔드 실행**
```bash
cd client
npm start
```
프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 환경 변수 설정

`server/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

## 📡 API 엔드포인트

### 인증
- `POST /instauser/login` - 로그인
- `POST /instauser/join` - 회원가입
- `POST /instauser/kakao/login` - 카카오 로그인
- `POST /instauser/findpassword` - 비밀번호 찾기
- `POST /instauser/resetpassword` - 비밀번호 재설정

### 사용자
- `GET /instauser/user/:userId` - 사용자 정보 조회
- `POST /instauser/profile/upload` - 프로필 사진 업로드
- `DELETE /instauser/profile/image` - 프로필 사진 삭제
- `GET /instauser/search?q=검색어` - 사용자 검색

### 피드
- `GET /instahome` - 전체 피드 조회
- `GET /instahome/:userId` - 특정 사용자 피드 조회
- `GET /instahome/:feedId/images` - 피드 이미지 목록
- `DELETE /instahome/:feedId` - 피드 삭제

### 댓글
- `GET /instacomment/:feedId` - 댓글 목록 조회
- `POST /instacomment/` - 댓글 작성

### 좋아요
- `POST /instafeed/instaheart` - 좋아요 토글

### 메시지
- `GET /instamessage/rooms` - 메시지 방 목록
- `GET /instamessage/room/:roomId` - 메시지 조회
- `POST /instamessage/send` - 메시지 전송

## 🖼 주요 화면

### 로그인 페이지 (`/instalogin`)
- 일반 로그인
- 카카오 소셜 로그인
- 회원가입 링크

### 홈 피드 (`/instahome`)
- 게시물 피드
- 좋아요 및 댓글 기능
- 우측 추천 사용자 목록

### 프로필 페이지 (`/profile/:userId`)
- 사용자 프로필 정보
- 게시물 그리드 뷰
- 프로필 편집 (본인 프로필일 경우)

### 검색 페이지 (`/instasearch`)
- 사용자 검색
- 검색 결과 목록

### 탐색 페이지 (`/instaexplore`)
- 모든 게시물 탐색
- 그리드 레이아웃

### 메시지 페이지 (`/instadirect`)
- 실시간 메시지
- 채팅방 목록

## 🔐 인증

이 프로젝트는 JWT(JSON Web Token)를 사용한 인증 방식을 채택하고 있습니다. 대부분의 API 엔드포인트는 `Authorization: Bearer <token>` 헤더가 필요합니다.

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 👥 기여자

프로젝트 개발자

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**참고**: 이 프로젝트는 Instagram의 디자인을 참고하여 개발되었으며, 교육 및 포트폴리오 목적으로 제작되었습니다.

