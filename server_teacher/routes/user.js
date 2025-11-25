const express = require('express');
const router = express.Router();
const db = require("../db"); //.js생략상태
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_KEY = "server_secret_key"; // 해시 함수 실행 위해 사용할 키로 아주 긴 랜덤한 문자를 사용하길 권장하며, 노출되면 안됨.

// router.get("/", async(req, res) => {
//     try {

//     } catch (error) {
//         console.log("에러발생함 ", error);
//     }
// })


router.get("/:userId", async (req, res) => {
    
    let { userId } = req.params;
    console.log("겟 라이우터 진입 /userId부분", userId);
    try {
        // 1. 두개 쿼리 써서 리턴
        // let [list] = await db.query("SELECT * FROM tbl_user WHERE userId = ?", {userId})
        // let [cnt] = await db.query("SELECT count(*) FROM tbl_feed WHERE userId = ?", {userId})
        // res.json({
        //     user : list[0],
        //     cnt: cnt[0],
        // });
        // 2. 조인쿼리 만들어서 하나로 리턴
        let sql =
            "SELECT U.*, IFNULL(T.CNT, 0) CNT " +
            "FROM TBL_USER U " +
            "LEFT JOIN ( " +
            "    SELECT USERID, COUNT(*) CNT " +
            "    FROM TBL_FEED " +
            "    GROUP BY USERID " +
            ") T ON U.USERID = T.USERID " +
            "WHERE U.USERID = ?";
        let [list] = await db.query(sql, [userId]);
        res.json({
            user: list[0],
            result: "success"
        })


    } catch (error) {
        console.log("에러발생함 ", error);
    }
})




router.post("/join", async (req, res) => {
    let { userId, pwd, userName } = req.body;
    // console.log("idRef는 ", idRef );
    // console.log("pwRef는 ", pwRef );
    // console.log("nmRef는 ", nmRef );
    try {
        const hashPwd = await bcrypt.hash(pwd, 10);
        // console.log(hashPwd);
        let sql = "INSERT INTO tbl_user(USERID, PWD, userName) VALUES (?,?,?) ";
        let result = await db.query(sql, [userId, hashPwd, userName]);
        res.json({
            result: result,
            msg: "가입되었습니다.",
        });
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})


router.post("/login", async (req, res) => {
    let { userId, pwd } = req.body;
    try {
        let sql = "SELECT * FROM TBL_USER WHERE USERID = ?"
        let [list] = await db.query(sql, [userId]);
        let msg = "";
        let result = false;
        let token = null;
        if (list.length > 0) {
            //아이디 존재함
            let match = await bcrypt.compare(pwd, list[0].pwd);
            if (match) {

                msg = list[0].userId + "님 환영합니다!";
                result = true;

                let user = {
                    userId: list[0].userId,
                    userName: list[0].userName,
                    status: "A" //권한 하드코딩 (db없어서)
                    // 권한 등 필요한 정보 추가
                };

                token = jwt.sign(user, JWT_KEY, { expiresIn: '1h' });
                //  const token = jwt.sign({userId : user.id, name : user.name}, JWT_KEY, {expiresIn : '1h'});
                console.log(token);

            } else {
                msg = "비밀번호를 확인해라";
            }
        } else {
            //아이디 없음
            msg = "아이디가 존재하지 않습니다."
        }

        // 토큰 담아서 리턴
        res.json({
            result: result,
            msg: msg,
            token //token:token   //서버가 로그인 시도당하고 성공하면 토큰을 클라이언트로 줌
        });

    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})




module.exports = router;