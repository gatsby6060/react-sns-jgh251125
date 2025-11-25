const express = require('express');
const router = express.Router();
const db = require("../db"); //.js생략상태
const authMiddleware = require("../auth");
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/upload', upload.array('file'), async (req, res) => {
    let { feedId } = req.body;
    const files = req.files;
    // const filename = req.file.filename; 
    // const destination = req.file.destination; 
    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;
        for (let file of files) {
            let filename = file.filename;
            let destination = file.destination; // uploads/
            let query = "INSERT INTO TBL_FEED_IMG VALUES(NULL, ?, ?, ?)";
            let result = await db.query(query, [feedId, filename, host + destination + filename]);
            results.push(result);
        }
        res.json({
            message: "result",
            result: results
        });
    } catch (err) {
        console.log("에러 발생!", err);
        // console.log(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:userId", async (req, res) => { //피드목록볼떄
    console.log("/feed/:userId 겟 라이우터 진입 /userId부분");
    console.log(`${req.protocol}://${req.get("host")}`);
    let { userId } = req.params;

    try {
        // 1. 두개 쿼리 써서 리턴방식
        // let [list] = await db.query("SELECT * FROM tbl_user WHERE userId = ?", {userId})
        // let [cnt] = await db.query("SELECT count(*) FROM tbl_feed WHERE userId = ?", {userId})
        // res.json({
        //     user : list[0],
        //     cnt: cnt[0],
        // });

        // 2. 조인쿼리 만들어서 하나로 리턴
        let sql = "select *  "
            + "from tbl_feed F "
            + "INNER JOIN tbl_feed_img I ON F.ID = I.feedId "
            + "WHERE F.USERID = ? ";
        let [list] = await db.query(sql, [userId]);
        res.json({
            list: list,
            result: "success"
        })


    } catch (error) {
        console.log("에러발생함 ", error);
    }
})




router.delete("/:feedid", authMiddleware, async (req, res) => {
    console.log("/feed/:userId delete라우터 진입 /id부분");
    let { feedid } = req.params;

    try {
        let sql = "DELETE FROM tbl_feed "
            + "WHERE id = ? ";
        let [list] = await db.query(sql, [feedid]);
        res.json({
            list: list,
            result: "success"
        })


    } catch (error) {
        console.log("삭제중에 에러발생함 ", error);
    }
})


//REACT -> userId, content로 보내주고
//서버에서 POST로 처리
// router.post("/:userId", authMiddleware, async (req, res) => {
router.post("/", async (req, res) => {
    console.log("/feed/:userId POST라우터 진입");
    // let { userId, content } = req.params;
    let { userId, content } = req.body;
    try {
        let sql = "INSERT INTO tbl_feed  VALUES "
            + "(NULL , ?, ?, NOW()) ";
        let result = await db.query(sql, [userId, content]);
        console.log(result);
        res.json({
            result: result,
            msg: "success"
        })


    } catch (error) {
        console.log("데이터 삽입 중에 에러발생함 ", error);
    }
})



module.exports = router;