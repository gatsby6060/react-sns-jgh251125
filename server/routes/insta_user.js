const express = require('express');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');

// 회원가입
router.post("/join", async (req, res) => {
    let { userId, pwd, userName, email } = req.body;
    
    try {
        // 비밀번호 해시화
        const hashPwd = await bcrypt.hash(pwd, 10);
        
        // INSTA_TBL_USER 테이블에 데이터 삽입
        let sql = "INSERT INTO INSTA_TBL_USER(USER_ID, PASSWORD, USERNAME, EMAIL) VALUES (?,?,?,?) ";
        let result = await db.query(sql, [userId, hashPwd, userName, email]);
        
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

module.exports = router;

