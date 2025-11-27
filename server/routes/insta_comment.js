const express = require('express');
const router = express.Router();
const db = require("../db");

// 댓글 등록 POST 라우터
router.post("/", async (req, res) => {
    let { feedId, userId, content } = req.body; 

    if (!feedId || !userId || !content) {
        return res.status(400).json({ result: "error", message: "필수 정보가 누락되었습니다." });
    }

    try {
        const sql = `
            INSERT INTO insta_tbl_comment (FEED_ID, USER_ID, CONTENT, CREATED_AT)
            VALUES (?, ?, ?, NOW())
        `;
        
        const [result] = await db.query(sql, [feedId, userId, content]);

        res.json({
            result: "success",
            message: "댓글이 성공적으로 등록되었습니다.",
            insertId: result.insertId
        });

    } catch (error) {
        console.error("댓글 삽입 중 에러 발생:", error);
        res.status(500).json({ result: "error", message: "댓글 등록에 실패했습니다." });
    }
});

// 댓글 조회 GET 라우터
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