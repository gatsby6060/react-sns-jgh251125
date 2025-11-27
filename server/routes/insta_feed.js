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

// ... (이전 코드 유지: require, storage, upload 설정) ...

router.post('/upload', upload.array('file'), async (req, res) => {
    let { feedId } = req.body;
    const files = req.files;

    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;

        for (let file of files) {
            let filename = file.filename;
            let destination = file.destination; // uploads/

            // ⭐ 1. 파일의 MIME 타입(file.mimetype)을 기반으로 mediaType 결정
            let mediaType;
            if (file.mimetype.startsWith('image/')) {
                mediaType = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                mediaType = 'video';
            } else {
                // 지원하지 않는 파일 형식인 경우 처리 (선택 사항)
                console.warn(`Unsupported file type uploaded: ${file.mimetype}`);
                mediaType = 'image'; // 또는 에러 처리
            }
            
            // ⭐ 2. DB 쿼리 수정: mediaType 컬럼을 추가하여 삽입
            // INSERT INTO INSTA_TBL_FEED_IMG VALUES(imgNo, feedId, imgName, imgPath, mediaType)
            // MySQL의 imgNo가 AUTO_INCREMENT라면 NULL을 사용합니다.
            let query = "INSERT INTO INSTA_TBL_FEED_IMG (feedId, imgName, imgPath, mediaType) VALUES(?, ?, ?, ?)";
            
            let fullPath = host + destination + filename;

            console.log("feedId:", feedId);
            console.log("filename:", filename);
            console.log("fullPath:", fullPath);
            console.log("mediaType:", mediaType); // <-- 새로 추가된 로그

            // 쿼리 파라미터에 mediaType 추가
            let result = await db.query(query, [feedId, filename, fullPath, mediaType]);
            
            results.push(result);
        }

        res.json({
            message: "result",
            result: results
        });
    } catch (err) {
        console.log("에러 발생!", err);
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
            + "from insta_tbl_feed F "
            + "INNER JOIN insta_tbl_feed_img I ON F.ID = I.feedId "
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
        let sql = "DELETE FROM insta_tbl_feed "
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
        let sql = "INSERT INTO insta_tbl_feed (USER_ID,TITLE,CONTENT,CREATED_AT) VALUES "
            + "(? , ?, ?, NOW()) ";
        let result = await db.query(sql, [userId, content, content]);
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