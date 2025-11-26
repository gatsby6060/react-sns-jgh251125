const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_KEY = "server_secret_key"; // 해시 함수 실행 위해 사용할 키로 아주 긴 랜덤한 문자를 사용하길 권장하며, 노출되면 안됨.


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

module.exports = router;

