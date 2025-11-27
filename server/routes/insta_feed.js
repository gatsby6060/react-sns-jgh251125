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


router.get("/:userId", async (req, res) => {
    let { userId } = req.params;

    try {
        let sql = "select *  "
            + "from insta_tbl_feed F "
            + "INNER JOIN insta_tbl_feed_img I ON F.FEED_ID = I.feedId "
            + "WHERE F.USER_ID = ? ";
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
    let { feedid } = req.params;
    let userId = req.user.userId;

    try {
        // 먼저 해당 피드가 현재 사용자의 것인지 확인
        let checkSql = "SELECT USER_ID FROM insta_tbl_feed WHERE FEED_ID = ?";
        let [checkResult] = await db.query(checkSql, [feedid]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ result: "error", message: "피드를 찾을 수 없습니다." });
        }
        
        if (checkResult[0].USER_ID !== userId) {
            return res.status(403).json({ result: "error", message: "본인의 피드만 삭제할 수 있습니다." });
        }
        
        let sql = "DELETE FROM insta_tbl_feed WHERE FEED_ID = ?";
        let [list] = await db.query(sql, [feedid]);
        res.json({
            list: list,
            result: "success"
        })
    } catch (error) {
        console.log("삭제중에 에러발생함 ", error);
        res.status(500).json({ result: "error", message: "삭제 중 오류가 발생했습니다." });
    }
})

router.post("/", async (req, res) => {
    let { userId, content } = req.body;
    try {
        let sql = "INSERT INTO insta_tbl_feed (USER_ID, CONTENT, CREATED_AT) VALUES "
            + "(? , ?, NOW()) ";
        let result = await db.query(sql, [userId, content]);
        res.json({
            result: result,
            msg: "success"
        })
    } catch (error) {
        console.log("데이터 삽입 중에 에러발생함 ", error);
    }
})



module.exports = router;