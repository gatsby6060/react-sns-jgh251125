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
            // ⭐ 수정 1: 테이블 이름 통일
            let query = "INSERT INTO insta_tbl_feed_img VALUES(NULL, ?, ?, ?)"; 
            let result = await db.query(query, [feedId, filename, host + destination + filename]);
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



/**
 * 파일 경로를 분석하여 mediaType을 결정합니다.
 * @param {string} path - 파일 경로 (예: http://localhost:3010/uploads/123-video.mp4)
 * @returns {string} 'video', 'image', 또는 'unknown'
 */
const getMediaType = (path) => {
    if (!path || typeof path !== 'string') return 'unknown';

    const lowerPath = path.toLowerCase();

    // 일반적인 동영상 확장자
    if (lowerPath.endsWith('.mp4') || lowerPath.endsWith('.webm') || lowerPath.endsWith('.mkv') || lowerPath.endsWith('.mov')) {
        return 'video';
    }
    // 일반적인 이미지 확장자
    if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg') || lowerPath.endsWith('.png') || lowerPath.endsWith('.gif')) {
        return 'image';
    }

    return 'unknown';
};
router.get("/", async (req, res) => {
    console.log("insta_home.js파일진입  get / 진입");
    try {
        let sql = `
            SELECT I.imgNo, I.ImgPath, F.* FROM insta_tbl_feed F
             LEFT JOIN insta_tbl_feed_img I
             ON F.FEED_ID = I.feedId
             AND I.imgNo = (
                 SELECT MIN(imgNo)
                 FROM insta_tbl_feed_img
                 WHERE feedId = F.FEED_ID
             )
             ORDER BY F.CREATED_AT DESC;
        `;

        let [list] = await db.query(sql);

        // ⭐⭐⭐ 핵심 수정: 미디어 타입 추가 ⭐⭐⭐
        const feedsWithMediaType = list.map(feed => {
            // ImgPath가 null인 경우나, 경로가 있지만 mediaType이 없는 경우를 처리
            const mediaType = getMediaType(feed.ImgPath);
            return {
                ...feed, // 기존 필드 유지 (imgNo, ImgPath, F.* 등)
                mediaType: mediaType // 새로 추가된 필드
            };
        });
        // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

        res.json({ list: feedsWithMediaType, result: "success" }); // 수정된 리스트 반환
    } catch (error) {
        console.log("전체 피드 조회 중 에러발생함 ", error);
        res.status(500).json({ error: "Failed to fetch feeds" });
    }
});


router.get("/:userId", async (req, res) => { //피드목록볼떄

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
            + "INNER JOIN insta_tbl_feed_img I ON F.FEED_ID = I.feedId "
            + "WHERE F.USER_ID = ? ";
        let completedSql = sql.replace("?", `"${userId}"`);
        console.log("완성된 SQL: ", completedSql);
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
    // console.log("/instahome/:userId POST라우터 진입");
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

// GET /instahome/:feedId/images  피드내용 상세시 사진 더 가져오려는 의도
router.get("/:feedId/images", async (req, res) => {
const feedId = req.params.feedId;
try {
const sql = `
SELECT imgNo, ImgPath, imgName 
FROM insta_tbl_feed_img 
WHERE feedId = ? 

AND imgNo != ( 
SELECT MIN(imgNo) 
FROM insta_tbl_feed_img 
WHERE feedId = ? 
)
ORDER BY imgNo ASC; 
`;
// feedId를 두 번 전달합니다.
const [rows] = await db.query(sql, [feedId, feedId]); 
// ⭐ 수정 3: 미디어 타입 추가
const imagesWithMediaType = rows.map(item => ({
...item,
mediaType: getMediaType(item.ImgPath) }));

res.json({ images: imagesWithMediaType, result: "success" });
} catch (error) {
 console.error("Error fetching images for feed:", error);
 res.status(500).json({ result: "error", message: "Failed to fetch images" });
}
});

module.exports = router;