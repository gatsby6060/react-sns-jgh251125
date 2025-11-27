//insta_comment.js 파일

const express = require('express');
const router = express.Router();
const db = require("../db"); //.js생략상태
const authMiddleware = require("../auth");
const multer = require('multer');


// 💡 댓글 등록 POST 라우터
router.post("/", async (req, res) => {
    // 프론트엔드에서 body로 전달받을 데이터
    let { feedId, userId, content } = req.body; 

    // 모든 필드가 있는지 확인하는 간단한 유효성 검사
    if (!feedId || !userId || !content) {
        return res.status(400).json({ result: "error", message: "필수 정보(feedId, userId, content)가 누락되었습니다." });
    }

    try {
        // insta_tbl_comment 테이블에 데이터 삽입
        const sql = `
            INSERT INTO insta_tbl_comment (FEED_ID, USER_ID, CONTENT, CREATED_AT)
            VALUES (?, ?, ?, NOW())
        `;
        
        /////////////완성된 쿼리문을 콘솔에 출력하는 코드 추가 ⭐
        const completedSql = `
            INSERT INTO insta_tbl_comment (FEED_ID, USER_ID, CONTENT, CREATED_AT)
            VALUES (${feedId}, '${userId}', '${content.replace(/'/g, "\\'")}', NOW())
        `.trim(); // .trim()으로 시작/끝 공백 제거
        
        console.log("실행될 SQL 쿼리: ", completedSql);
        ////////////////////

        // COMMENT_ID는 DB에서 자동으로 생성(AUTO_INCREMENT)된다고 가정합니다.
        const [result] = await db.query(sql, [feedId, userId, content]);

        res.json({
            result: "success",
            message: "댓글이 성공적으로 등록되었습니다.",
            insertId: result.insertId // 새로 삽입된 댓글 ID 반환
        });

    } catch (error) {
        console.error("댓글 삽입 중 에러 발생:", error);
        res.status(500).json({ result: "error", message: "댓글 등록에 실패했습니다." });
    }
});




// insta_comment.js 파일 내부에 추가

// 💡 댓글 조회 GET 라우터
router.get("/:feedId", async (req, res) => {
    let { feedId } = req.params; 

    try {
        const sql = `
            SELECT COMMENT_ID, USER_ID, CONTENT, CREATED_AT 
            FROM insta_tbl_comment 
            WHERE FEED_ID = ? 
            ORDER BY CREATED_AT ASC
        `;
        
        const [comments] = await db.query(sql, [feedId]);

        res.json({
            result: "success",
            comments: comments
        });

    } catch (error) {
        console.error("댓글 조회 중 에러 발생:", error);
        res.status(500).json({ result: "error", message: "댓글 조회에 실패했습니다." });
    }
});


module.exports = router;