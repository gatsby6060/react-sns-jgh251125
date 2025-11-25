const express = require('express');
const router = express.Router();
const db = require("../db"); //.js생략상태

router.get("/", async(req, res) => {
    try {
        // console.log(req.params.keyword);
        // console.log(req);
        console.log(req.query);
        let {keyword} = req.query;
        console.log(keyword);
        let sql = "SELECT * FROM TBL_PRODUCT WHERE PRODUCTNAME LIKE ?";
        let [list] = await db.query(sql, [`%${keyword}%`]);
        console.log(list);
        res.json({
            result: "success",
            list: list,
        });
    } catch (error) {
        console.log("product 에러발생! ", error);
    }
})

router.delete("/:productId", async (req, res) => {
    let { productId } = req.params;
    try {
        let sql = "DELETE FROM TBL_PRODUCT WHERE PRODUCTID = ?";
        let result = await db.query(sql, [productId]);
        res.json({
            result : result,
            msg: "삭제 완료",
        });
    } catch (error) {
        console.log("에러 발생!");
    }
})

router.post("/", async (req, res) => {
    let { productName, price } = req.body;
    try {
        let sql = "INSERT INTO TBL_PRODUCT(PRODUCTNAME, PRICE) VALUES (?,?) ";
        let result = await db.query(sql, [productName, price]);
        res.json({
            result : result,
            msg: "저장 완료",
        });
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

module.exports = router;