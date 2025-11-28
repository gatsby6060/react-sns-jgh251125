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

// router.get("/", authMiddleware, async (req, res) => {
//     console.log("insta_home.js 파일진입 get / 진입");
    
//     // 💡 authMiddleware를 통해 현재 로그인한 사용자 ID를 추출
//     const currentUserId = req.user.userId;

//     try {
//         let sql = `
//             SELECT 
//                 F.*, 
//                 I.imgNo, 
//                 I.ImgPath, 
//                 -- 💡 1. 현재 사용자의 좋아요 여부를 확인
//                 CASE WHEN L.FEED_ID IS NOT NULL THEN TRUE ELSE FALSE END AS isLiked
//             FROM 
//                 insta_tbl_feed F
            
//             -- 💡 2. 피드의 첫 번째 이미지(대표 이미지)를 가져오기 위한 LEFT JOIN
//             LEFT JOIN 
//                 insta_tbl_feed_img I
//             ON 
//                 F.FEED_ID = I.feedId
//             AND 
//                 I.imgNo = (
//                     SELECT MIN(imgNo)
//                     FROM insta_tbl_feed_img
//                     WHERE feedId = F.FEED_ID
//                 )
            
//             -- 💡 3. 현재 사용자가 해당 피드에 좋아요를 눌렀는지 확인하기 위한 LEFT JOIN
//             LEFT JOIN 
//                 insta_tbl_like L
//             ON 
//                 F.FEED_ID = L.FEED_ID AND L.USER_ID = ?  -- 현재 사용자 ID와 일치하는 좋아요 기록만 JOIN
            
//             ORDER BY 
//                 F.CREATED_AT DESC;
//         `;

//         // 💡 쿼리 파라미터로 현재 사용자 ID를 전달
//         let [list] = await db.query(sql, [currentUserId]); 

//         // 기존 스타일 유지: ImagePath를 기반으로 mediaType을 계산
//         const feedsWithMediaType = list.map(feed => {
//             // ImgPath가 NULL인 경우를 대비하여 체크
//             const mediaType = feed.ImgPath ? getMediaType(feed.ImgPath) : null;
//             return {
//                 ...feed,
//                 mediaType: mediaType
//             };
//         });

//         res.json({ list: feedsWithMediaType, result: "success" });
//     } catch (error) {
//         console.log("전체 피드 조회 중 에러발생함 ", error);
//         res.status(500).json({ error: "Failed to fetch feeds" });
//     }
// });

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

        const feedsWithMediaType = list.map(feed => {
            const mediaType = getMediaType(feed.ImgPath);
            return {
                ...feed,
                mediaType: mediaType
            };
        });

        res.json({ list: feedsWithMediaType, result: "success" });
    } catch (error) {
        console.log("전체 피드 조회 중 에러발생함 ", error);
        res.status(500).json({ error: "Failed to fetch feeds" });
    }
});


router.get("/:userId", async (req, res) => {
    let { userId } = req.params;

    try {
        let sql = `
            SELECT I.imgNo, I.ImgPath, I.imgName, F.* 
            FROM insta_tbl_feed F
            LEFT JOIN insta_tbl_feed_img I 
            ON F.FEED_ID = I.feedId
            AND I.imgNo = (
                SELECT MIN(imgNo)
                FROM insta_tbl_feed_img
                WHERE feedId = F.FEED_ID
            )
            WHERE F.USER_ID = ?
            ORDER BY F.CREATED_AT DESC
        `;
        let [list] = await db.query(sql, [userId]);
        
        const feedsWithMediaType = list.map(feed => {
            const mediaType = getMediaType(feed.ImgPath);
            return {
                ...feed,
                mediaType: mediaType
            };
        });
        
        res.json({
            list: feedsWithMediaType,
            result: "success"
        })
    } catch (error) {
        console.log("에러발생함 ", error);
        res.status(500).json({ result: "error", message: "피드 조회 중 오류가 발생했습니다." });
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
            ORDER BY imgNo ASC
        `;
        const [rows] = await db.query(sql, [feedId, feedId]); 
        const imagesWithMediaType = rows.map(item => ({
            ...item,
            mediaType: getMediaType(item.ImgPath)
        }));
        res.json({ images: imagesWithMediaType, result: "success" });
    } catch (error) {
        console.error("Error fetching images for feed:", error);
        res.status(500).json({ result: "error", message: "Failed to fetch images" });
    }
});

module.exports = router;