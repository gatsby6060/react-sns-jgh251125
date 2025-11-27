const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const authMiddleware = require("../auth");
const JWT_KEY = "server_secret_key";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


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
router.get("/:userId", async (req, res) => {
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

module.exports = router;

