const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const authMiddleware = require("../auth");
// //251130카카오로그인 관련4: Node.js 내장 fetch 사용 (axios 불필요)
const JWT_KEY = "server_secret_key";


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const nodemailer = require('nodemailer');

// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "c46fe73fa8d183",
        pass: "ef97e38546fc2b"
    }
});

// 회원가입
router.post("/join", async (req, res) => {
    let { userId, pwd, userName, emailorphone } = req.body;

    try {
        // 비밀번호 해시화
        const hashPwd = await bcrypt.hash(pwd, 10);

        // INSTA_TBL_USER 테이블에 데이터 삽입
        let sql = "INSERT INTO INSTA_TBL_USER(USER_ID, PASSWORD, USERNAME, EMAILORPHONE) VALUES (?,?,?,?) ";
        let result = await db.query(sql, [userId, hashPwd, userName, emailorphone]);

        res.json({
            result: result,
            msg: "가입되었습니다.",
        });
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
        res.json({
            result: false,
            msg: "회원가입 중 오류가 발생했습니다.",
        });
    }
})



router.post("/login", async (req, res) => {
    let { userId, pwd } = req.body;

    try {

        let user = null;

        // 1) USER_ID로 검색
        let sql1 = "SELECT * FROM INSTA_TBL_USER WHERE USER_ID = ?";
        let [list] = await db.query(sql1, [userId]);

        if (list.length > 0) {
            user = list[0]; // USER_ID 일치
        } else {
            // 2) EMAILORPHONE로 검색
            let sql2 = "SELECT * FROM INSTA_TBL_USER WHERE EMAILORPHONE = ?";
            let [list2] = await db.query(sql2, [userId]);

            if (list2.length > 0) {
                user = list2[0]; // EMAILORPHONE 일치
            } else {
                // 둘 다 없으면
                return res.json({ result: false, msg: "가입된 정보가 존재하지 않습니다." });
            }
        }


        // 비밀번호 체크
        const match = await bcrypt.compare(pwd, user.PASSWORD);
        if (!match) {
            return res.json({ result: false, msg: "비밀번호를 확인해라" });
        }

        // 로그인 성공 → 토큰 발급
        const payload = {
            userId: user.USER_ID,
            userName: user.USERNAME,
            status: "A"
        };
        const token = jwt.sign(payload, JWT_KEY, { expiresIn: "1h" });

        return res.json({
            result: true,
            msg: `${user.USER_ID}님 환영합니다!`,
            token
        });

    } catch (error) {
        console.error("로그인 에러:", error);
        return res.status(500).json({ result: false, msg: "서버 에러" });
    }
})

// 사용자 이름 중복 체크
router.get("/check/username/:username", async (req, res) => {
    let { username } = req.params;
    try {
        let sql = "SELECT USER_ID FROM insta_tbl_user WHERE USER_ID = ?";
        let [list] = await db.query(sql, [username]);
        res.json({
            isDuplicate: list.length > 0,
            result: "success"
        });
    } catch (error) {
        console.log("중복 체크 중 에러:", error);
        res.status(500).json({ result: "error", message: "중복 체크 중 오류가 발생했습니다." });
    }
});

// 이메일/휴대폰 중복 체크
router.get("/check/email/:email", async (req, res) => {
    let { email } = req.params;
    try {
        let sql = "SELECT USER_ID FROM insta_tbl_user WHERE EMAILORPHONE = ?";
        let [list] = await db.query(sql, [email]);
        res.json({
            isDuplicate: list.length > 0,
            result: "success"
        });
    } catch (error) {
        console.log("중복 체크 중 에러:", error);
        res.status(500).json({ result: "error", message: "중복 체크 중 오류가 발생했습니다." });
    }
});

// 사용자 정보 조회
router.get("/user/:userId", async (req, res) => {
    console.log("겟방식 /user/:user진입");
    let { userId } = req.params;

    try {
        let sql = `
            SELECT U.*, 
                   IFNULL((
                       SELECT COUNT(*) 
                       FROM insta_tbl_feed 
                       WHERE USER_ID = U.USER_ID
                   ), 0) AS FEED_COUNT,
                   IFNULL((
                       SELECT COUNT(*) 
                       FROM insta_tbl_follow 
                       WHERE FOLLOWING_ID = U.USER_ID
                   ), 0) AS FOLLOWER,
                   IFNULL((
                       SELECT COUNT(*) 
                       FROM insta_tbl_follow 
                       WHERE FOLLOWER_ID = U.USER_ID
                   ), 0) AS FOLLOWING
            FROM insta_tbl_user U
            WHERE U.USER_ID = ?
        `;
        let [list] = await db.query(sql, [userId]);

        if (list.length > 0) {
            res.json({
                user: list[0],
                result: "success"
            });
        } else {
            res.status(404).json({
                result: "error",
                message: "사용자를 찾을 수 없습니다."
            });
        }
    } catch (error) {
        console.log("에러발생함 ", error);
        res.status(500).json({
            result: "error",
            message: "사용자 정보 조회 중 오류가 발생했습니다."
        });
    }
});

// 프로필 사진 업로드
router.post("/profile/upload", authMiddleware, upload.single('file'), async (req, res) => {
    let userId = req.user.userId;
    let file = req.file;

    if (!file) {
        return res.status(400).json({ result: "error", message: "파일이 없습니다." });
    }

    try {
        let host = `${req.protocol}://${req.get("host")}/`;
        let filename = file.filename;
        let destination = file.destination;
        let profileImgPath = host + destination + filename;

        let sql = "UPDATE insta_tbl_user SET PROFILE_IMG = ? WHERE USER_ID = ?";
        await db.query(sql, [profileImgPath, userId]);

        res.json({
            result: "success",
            message: "프로필 사진이 업로드되었습니다.",
            profileImg: profileImgPath
        });
    } catch (error) {
        console.error("프로필 사진 업로드 중 에러:", error);
        res.status(500).json({ result: "error", message: "프로필 사진 업로드에 실패했습니다." });
    }
});

// 프로필 사진 삭제
router.delete("/profile/image", authMiddleware, async (req, res) => {
    let userId = req.user.userId;

    try {
        let sql = "UPDATE insta_tbl_user SET PROFILE_IMG = NULL WHERE USER_ID = ?";
        await db.query(sql, [userId]);

        res.json({
            result: "success",
            message: "프로필 사진이 삭제되었습니다."
        });
    } catch (error) {
        console.error("프로필 사진 삭제 중 에러:", error);
        res.status(500).json({ result: "error", message: "프로필 사진 삭제에 실패했습니다." });
    }
});

// //251130카카오로그인 관련5: 카카오 로그인 엔드포인트 - 클라이언트에서 받은 액세스 토큰으로 카카오 사용자 정보 조회 후 로그인/회원가입 처리
router.post("/kakao/login", async (req, res) => {
    let { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ result: false, msg: "카카오 액세스 토큰이 필요합니다." });
    }

    try {
        // 카카오 사용자 정보 조회 (Node.js 내장 fetch 사용)
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`카카오 API 호출 실패: ${response.status}`);
        }

        const kakaoUserInfo = await response.json();
        const kakaoId = kakaoUserInfo.id.toString();
        const kakaoEmail = kakaoUserInfo.kakao_account?.email || null;
        const kakaoNickname = kakaoUserInfo.kakao_account?.profile?.nickname || `카카오${kakaoId.slice(-4)}`;
        const kakaoProfileImg = kakaoUserInfo.kakao_account?.profile?.profile_image_url || null;

        // 기존 사용자 확인 (카카오 ID로) - 두 가지 형태 모두 확인
        let sql = "SELECT * FROM INSTA_TBL_USER WHERE (USER_ID = ? OR USER_ID = ?) OR EMAILORPHONE = ?";
        let [existingUsers] = await db.query(sql, [`kakao_${kakaoId}`, `kakao_${kakaoId}_kakao`, kakaoEmail || '']);

        let user;
        if (existingUsers.length > 0) {
            // 기존 사용자 - 로그인 처리
            user = existingUsers[0];

            // 기존 사용자가 kakao_${kakaoId} 형태로 저장되어 있다면 kakao_${kakaoId}_kakao로 업데이트
            if (user.USER_ID === `kakao_${kakaoId}`) {
                let newUserId = `kakao_${kakaoId}_kakao`;
                let updateSql = "UPDATE INSTA_TBL_USER SET USER_ID = ? WHERE USER_ID = ?";
                await db.query(updateSql, [newUserId, user.USER_ID]);
                user.USER_ID = newUserId;
            }

            // 프로필 이미지 업데이트 (있는 경우)
            if (kakaoProfileImg && !user.PROFILE_IMG) {
                let updateSql = "UPDATE INSTA_TBL_USER SET PROFILE_IMG = ? WHERE USER_ID = ?";
                await db.query(updateSql, [kakaoProfileImg, user.USER_ID]);
                user.PROFILE_IMG = kakaoProfileImg;
            }
        } else {
            // 신규 사용자 - 자동 회원가입 (앞뒤로 kakao 붙이기)
            let newUserId = `kakao_${kakaoId}_kakao`;
            let insertSql = "INSERT INTO INSTA_TBL_USER(USER_ID, PASSWORD, USERNAME, EMAILORPHONE, PROFILE_IMG) VALUES (?,?,?,?,?)";
            await db.query(insertSql, [
                newUserId,
                '', // 카카오 로그인은 비밀번호 없음
                kakaoNickname,
                kakaoEmail || '',
                kakaoProfileImg
            ]);

            // 새로 생성된 사용자 정보 조회
            let selectSql = "SELECT * FROM INSTA_TBL_USER WHERE USER_ID = ?";
            let [newUser] = await db.query(selectSql, [newUserId]);
            user = newUser[0];
        }

        // JWT 토큰 발급
        const payload = {
            userId: user.USER_ID,
            userName: user.USERNAME,
            status: "A"
        };
        const token = jwt.sign(payload, JWT_KEY, { expiresIn: "1h" });

        return res.json({
            result: true,
            msg: `${user.USERNAME}님 환영합니다!`,
            token,
            user: {
                userId: user.USER_ID,
                userName: user.USERNAME,
                profileImg: user.PROFILE_IMG
            }
        });

    } catch (error) {
        console.error("카카오 로그인 에러:", error);
        if (error.response) {
            console.error("카카오 API 응답:", error.response.data);
        }
        return res.status(500).json({
            result: false,
            msg: "카카오 로그인 중 오류가 발생했습니다."
        });
    }
});



// ----------------- 비밀번호 찾기: 토큰 생성, DB 저장, 메일 전송 -----------------
router.post("/find-password", async (req, res) => {
    console.log("user/find-password 진입");
    try {
        const { emailOrId } = req.body || {};
        if (!emailOrId) return res.status(400).json({ result: false, msg: "값이 필요합니다." });

        // 사용자 조회 (ID 또는 EMAILORPHONE)
        let sql = "SELECT * FROM INSTA_TBL_USER WHERE USER_ID = ? OR EMAILORPHONE = ?";
        let [list] = await db.query(sql, [emailOrId, emailOrId]);

        if (list.length === 0) {
            // 보안상 존재여부를 노출하지 않으려면 아래처럼도 처리 가능:
            // return res.json({ result: true, msg: '요청을 처리했습니다. 메일을 확인하세요.' });
            return res.status(404).json({ result: false, msg: "해당 사용자를 찾을 수 없습니다." });
        }

        const user = list[0];

        // 1) 토큰 생성 (JWT 사용) — 토큰에 목적 포함
        const token = jwt.sign({ userId: user.USER_ID, purpose: 'pw-reset' }, JWT_KEY, { expiresIn: '30m' });
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30분 후

        // 2) DB에 토큰 저장 (insta_tbl_password_reset 테이블 필요)
        const insertSql = "INSERT INTO insta_tbl_password_reset (user_id, token, expires_at) VALUES (?,?,?)";
        await db.query(insertSql, [user.USER_ID, token, expiresAt]);

        // 3) 리셋 URL 생성 (프론트 주소에 맞춰 수정)
        const resetUrl = `http://localhost:3000/instaresetpassword?token=${encodeURIComponent(token)}`;
        const isEmail = String(user.EMAILORPHONE || '').includes('@');
        // 4) 메일 옵션 준비
        const mailOptions = {
            from: '"서비스팀" <no-reply@example.com>',
            to: user.EMAILORPHONE, // 이메일이 맞는지 확인해야 함
            subject: '비밀번호 재설정 안내',
            text: `비밀번호 재설정을 원하시면 아래 링크를 클릭하세요:\n${resetUrl}\n\n(30분 내 유효)`,
            html: `<p>비밀번호 재설정을 원하시면 아래 링크를 클릭하세요 (30분 유효):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        };

        // 5) 이메일 전송 — EMAILORPHONE 컬럼에 이메일이 아닌 값(휴대폰)이 들어있을 가능성 고려
        // 5) 이메일 전송
        if (isEmail) {
            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('Password reset mail sent to', user.EMAILORPHONE, 'info:', info.messageId);
            } catch (mailErr) {
                console.warn('메일 전송 실패:', mailErr);
                console.log('resetUrl (fallback):', resetUrl);
            }
        } else {
            console.log('수신 이메일이 없거나 개발 모드 resetUrl:', resetUrl);
        }


        return res.json({ result: true, msg: '재설정 링크를 이메일로 발송했습니다. (개발모드: 콘솔/메일 확인)', resetUrl });
    } catch (err) {
        console.error("find-password error", err);
        return res.status(500).json({ result: false, msg: "서버 오류" });
    }
});

// ----------------- 비밀번호 재설정: 토큰 검증 + 비밀번호 변경 -----------------
router.post('/instaresetpassword', async (req, res) => {
    console.log("insta_user.js파일의 /instaresetpassword 진입");
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ result: false, msg: '값 누락' });

    try {
        // 1) DB에서 토큰 레코드 조회 (used=0인 것만)
        let sql = "SELECT * FROM insta_tbl_password_reset WHERE token = ? AND used = 0";
        let [list] = await db.query(sql, [token]);
        if (list.length === 0) return res.status(400).json({ result: false, msg: '유효하지 않거나 사용된 토큰입니다.' });

        const rec = list[0];
        if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ result: false, msg: '토큰 만료' });

        // 2) 비밀번호 해시화 및 사용자 비밀번호 업데이트
        const hashPwd = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE INSTA_TBL_USER SET PASSWORD = ? WHERE USER_ID = ?", [hashPwd, rec.user_id]);

        // 3) 토큰 사용 처리(재사용 방지)
        await db.query("UPDATE insta_tbl_password_reset SET used = 1 WHERE id = ?", [rec.id]);

        return res.json({ result: true, msg: '비밀번호가 변경되었습니다.' });
    } catch (err) {
        console.error('reset-password error', err);
        return res.status(500).json({ result: false, msg: '서버 에러' });
    }
});




// 사용자 프로필 수정 (USERNAME, INTRO, PROFILE_IMG 등)
router.put('/:userId', authMiddleware, async (req, res) => {
    console.log("insta_user.js파일 put /userId 진입");
  try {
    const { userId } = req.params;
    const { USERNAME, INTRO, PROFILE_IMG } = req.body || {};

    // authMiddleware에서 req.user.userId를 세팅하도록 되어있다면 권한 체크
    if (!req.user || req.user.userId !== userId) {
      return res.status(403).json({ result: 'fail', message: '권한이 없습니다.' });
    }

    // 최소한의 유효성 검사
    if (typeof USERNAME === 'undefined' && typeof INTRO === 'undefined' && typeof PROFILE_IMG === 'undefined') {
      return res.status(400).json({ result: 'fail', message: '수정할 필드가 없습니다.' });
    }

    // 업데이트 쿼리 구성: 전달된 필드만 업데이트하도록 동적 빌드
    const fields = [];
    const params = [];

    if (typeof USERNAME !== 'undefined') {
      fields.push('USERNAME = ?');
      params.push(USERNAME);
    }
    if (typeof INTRO !== 'undefined') {
      fields.push('INTRO = ?');
      params.push(INTRO);
    }
    if (typeof PROFILE_IMG !== 'undefined') {
      // PROFILE_IMG 를 null로 보내면 프로필 이미지 삭제(값 null) 처리 가능
      fields.push('PROFILE_IMG = ?');
      params.push(PROFILE_IMG);
    }

    params.push(userId); // WHERE 절의 파라미터

    const sql = `UPDATE insta_tbl_user SET ${fields.join(', ')} WHERE USER_ID = ?`;
    await db.query(sql, params);

    // 변경된 사용자 정보 반환 (선택)
    const [updated] = await db.query('SELECT USER_ID, USERNAME, INTRO, PROFILE_IMG FROM insta_tbl_user WHERE USER_ID = ?', [userId]);
    return res.json({ result: 'success', user: updated[0] || null });
  } catch (err) {
    console.error('프로필 수정 에러:', err);
    return res.status(500).json({ result: 'fail', message: '서버 에러' });
  }
});



// 사용자 검색 (intro 또는 username)
router.get("/search", authMiddleware, async (req, res) => {
    console.log("insta_user.js파일의 /search 진입");
    try {
        const q = req.query.q;

        let sql = `
            SELECT USER_ID, USERNAME, PROFILE_IMG, INTRO
            FROM insta_tbl_user
            WHERE USER_ID LIKE ? OR USERNAME LIKE ? OR INTRO LIKE ?
        `;
        let [rows] = await db.query(sql, [`%${q}%`, `%${q}%`, `%${q}%`]);

        res.json({ result: true, users: rows });
    } catch (err) {
        console.log("사용자 검색 오류:", err);
        res.json({ result: false, msg: "검색 오류 발생" });
    }
});


module.exports = router;

