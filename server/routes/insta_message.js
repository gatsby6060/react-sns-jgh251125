const express = require('express');
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../auth");

// 채팅방 목록 조회 (현재 사용자가 참여한 모든 채팅방)
router.get("/rooms", authMiddleware, async (req, res) => {
    let userId = req.user.userId;

    try {
        // 현재 사용자가 참여한 모든 채팅방 조회 (USER1_ID 또는 USER2_ID)
        let sql = `
            SELECT 
                r.ROOM_ID,
                r.USER1_ID,
                r.USER2_ID,
                r.CREATED_AT,
                CASE 
                    WHEN r.USER1_ID = ? THEN r.USER2_ID 
                    ELSE r.USER1_ID 
                END AS OTHER_USER_ID,
                u.USERNAME AS OTHER_USERNAME,
                u.PROFILE_IMG AS OTHER_PROFILE_IMG,
                last_msg.CONTENT AS LAST_MESSAGE,
                last_msg.CREATED_AT AS LAST_MESSAGE_TIME,
                last_msg.SENDER_ID AS LAST_SENDER_ID,
                (SELECT COUNT(*) 
                 FROM insta_tbl_chat_message 
                 WHERE ROOM_ID = r.ROOM_ID 
                 AND SENDER_ID != ? 
                 AND IS_READ = 0) AS UNREAD_COUNT
            FROM insta_tbl_chat_room r
            LEFT JOIN insta_tbl_user u ON (
                CASE 
                    WHEN r.USER1_ID = ? THEN r.USER2_ID 
                    ELSE r.USER1_ID 
                END = u.USER_ID
            )
            LEFT JOIN insta_tbl_chat_message last_msg ON r.LAST_MESSAGE_ID = last_msg.MESSAGE_ID
            WHERE r.USER1_ID = ? OR r.USER2_ID = ?
            ORDER BY last_msg.CREATED_AT DESC, r.CREATED_AT DESC
        `;
        
        let [rooms] = await db.query(sql, [userId, userId, userId, userId, userId]);

        res.json({
            result: "success",
            rooms: rooms
        });
    } catch (error) {
        console.error("채팅방 목록 조회 에러:", error);
        res.status(500).json({
            result: "error",
            message: "채팅방 목록을 불러오는 중 오류가 발생했습니다."
        });
    }
});

// 특정 채팅방의 메시지 조회
router.get("/rooms/:roomId/messages", authMiddleware, async (req, res) => {
    let { roomId } = req.params;
    let userId = req.user.userId;

    try {
        // 채팅방에 접근 권한 확인
        let checkSql = "SELECT * FROM insta_tbl_chat_room WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)";
        let [roomCheck] = await db.query(checkSql, [roomId, userId, userId]);

        if (roomCheck.length === 0) {
            return res.status(403).json({
                result: "error",
                message: "접근 권한이 없습니다."
            });
        }

        // 메시지 조회
        let sql = `
            SELECT 
                m.MESSAGE_ID,
                m.ROOM_ID,
                m.SENDER_ID,
                m.CONTENT,
                m.MEDIA_URL,
                m.MESSAGE_TYPE,
                m.IS_READ,
                m.CREATED_AT,
                u.USERNAME AS SENDER_USERNAME,
                u.PROFILE_IMG AS SENDER_PROFILE_IMG
            FROM insta_tbl_chat_message m
            LEFT JOIN insta_tbl_user u ON m.SENDER_ID = u.USER_ID
            WHERE m.ROOM_ID = ?
            ORDER BY m.CREATED_AT ASC
        `;
        
        let [messages] = await db.query(sql, [roomId]);

        // 읽지 않은 메시지를 읽음으로 표시 (자신이 보낸 메시지 제외)
        let updateReadSql = `
            UPDATE insta_tbl_chat_message 
            SET IS_READ = 1 
            WHERE ROOM_ID = ? AND SENDER_ID != ? AND IS_READ = 0
        `;
        await db.query(updateReadSql, [roomId, userId]);

        res.json({
            result: "success",
            messages: messages
        });
    } catch (error) {
        console.error("메시지 조회 에러:", error);
        res.status(500).json({
            result: "error",
            message: "메시지를 불러오는 중 오류가 발생했습니다."
        });
    }
});

// 메시지 전송
router.post("/rooms/:roomId/messages", authMiddleware, async (req, res) => {
    let { roomId } = req.params;
    let userId = req.user.userId;
    let { content, mediaUrl, messageType } = req.body;

    try {
        // 채팅방 존재 및 권한 확인
        let checkSql = "SELECT * FROM insta_tbl_chat_room WHERE ROOM_ID = ? AND (USER1_ID = ? OR USER2_ID = ?)";
        let [roomCheck] = await db.query(checkSql, [roomId, userId, userId]);

        if (roomCheck.length === 0) {
            return res.status(403).json({
                result: "error",
                message: "접근 권한이 없습니다."
            });
        }

        // 메시지 타입 기본값
        if (!messageType) {
            messageType = mediaUrl ? 'IMAGE' : 'TEXT';
        }

        // 메시지 저장
        let insertSql = `
            INSERT INTO insta_tbl_chat_message 
            (ROOM_ID, SENDER_ID, CONTENT, MEDIA_URL, MESSAGE_TYPE, IS_READ) 
            VALUES (?, ?, ?, ?, ?, 0)
        `;
        let [result] = await db.query(insertSql, [roomId, userId, content || null, mediaUrl || null, messageType]);
        let messageId = result.insertId;

        // 채팅방의 마지막 메시지 ID 업데이트
        let updateRoomSql = "UPDATE insta_tbl_chat_room SET LAST_MESSAGE_ID = ? WHERE ROOM_ID = ?";
        await db.query(updateRoomSql, [messageId, roomId]);

        // 저장된 메시지 정보 반환
        let selectSql = `
            SELECT 
                m.MESSAGE_ID,
                m.ROOM_ID,
                m.SENDER_ID,
                m.CONTENT,
                m.MEDIA_URL,
                m.MESSAGE_TYPE,
                m.IS_READ,
                m.CREATED_AT,
                u.USERNAME AS SENDER_USERNAME,
                u.PROFILE_IMG AS SENDER_PROFILE_IMG
            FROM insta_tbl_chat_message m
            LEFT JOIN insta_tbl_user u ON m.SENDER_ID = u.USER_ID
            WHERE m.MESSAGE_ID = ?
        `;
        let [message] = await db.query(selectSql, [messageId]);

        res.json({
            result: "success",
            message: message[0]
        });
    } catch (error) {
        console.error("메시지 전송 에러:", error);
        res.status(500).json({
            result: "error",
            message: "메시지 전송 중 오류가 발생했습니다."
        });
    }
});

// 새 채팅방 생성 또는 기존 채팅방 조회
router.post("/rooms", authMiddleware, async (req, res) => {
    let userId = req.user.userId;
    let { otherUserId } = req.body;

    if (!otherUserId) {
        return res.status(400).json({
            result: "error",
            message: "상대방 사용자 ID가 필요합니다."
        });
    }

    if (userId === otherUserId) {
        return res.status(400).json({
            result: "error",
            message: "자기 자신과는 채팅할 수 없습니다."
        });
    }

    try {
        // 상대방 사용자 존재 확인
        let userCheckSql = "SELECT * FROM insta_tbl_user WHERE USER_ID = ?";
        let [userCheck] = await db.query(userCheckSql, [otherUserId]);
        
        if (userCheck.length === 0) {
            return res.status(404).json({
                result: "error",
                message: "사용자를 찾을 수 없습니다."
            });
        }

        // 기존 채팅방 확인 (USER1_ID와 USER2_ID 순서 무관하게)
        let checkSql = `
            SELECT * FROM insta_tbl_chat_room 
            WHERE (USER1_ID = ? AND USER2_ID = ?) OR (USER1_ID = ? AND USER2_ID = ?)
        `;
        let [existingRoom] = await db.query(checkSql, [userId, otherUserId, otherUserId, userId]);

        if (existingRoom.length > 0) {
            // 기존 채팅방 반환
            let room = existingRoom[0];
            let otherUser = userCheck[0];
            
            return res.json({
                result: "success",
                room: {
                    ROOM_ID: room.ROOM_ID,
                    USER1_ID: room.USER1_ID,
                    USER2_ID: room.USER2_ID,
                    OTHER_USER_ID: otherUserId,
                    OTHER_USERNAME: otherUser.USERNAME,
                    OTHER_PROFILE_IMG: otherUser.PROFILE_IMG,
                    CREATED_AT: room.CREATED_AT
                },
                isNew: false
            });
        }

        // 새 채팅방 생성 (USER1_ID < USER2_ID 순서로 저장하여 중복 방지)
        let user1Id = userId < otherUserId ? userId : otherUserId;
        let user2Id = userId < otherUserId ? otherUserId : userId;

        let insertSql = "INSERT INTO insta_tbl_chat_room (USER1_ID, USER2_ID) VALUES (?, ?)";
        let [result] = await db.query(insertSql, [user1Id, user2Id]);
        let roomId = result.insertId;

        let otherUser = userCheck[0];
        
        res.json({
            result: "success",
            room: {
                ROOM_ID: roomId,
                USER1_ID: user1Id,
                USER2_ID: user2Id,
                OTHER_USER_ID: otherUserId,
                OTHER_USERNAME: otherUser.USERNAME,
                OTHER_PROFILE_IMG: otherUser.PROFILE_IMG,
                CREATED_AT: new Date()
            },
            isNew: true
        });
    } catch (error) {
        console.error("채팅방 생성 에러:", error);
        res.status(500).json({
            result: "error",
            message: "채팅방 생성 중 오류가 발생했습니다."
        });
    }
});

// 사용자 검색 (채팅 상대 찾기)
router.get("/search/users", authMiddleware, async (req, res) => {
    let { q } = req.query;
    let userId = req.user.userId;

    if (!q || q.trim() === '') {
        return res.json({
            result: "success",
            users: []
        });
    }

    try {
        let sql = `
            SELECT USER_ID, USERNAME, PROFILE_IMG 
            FROM insta_tbl_user 
            WHERE (USER_ID LIKE ? OR USERNAME LIKE ?) AND USER_ID != ?
            LIMIT 20
        `;
        let searchTerm = `%${q}%`;
        let [users] = await db.query(sql, [searchTerm, searchTerm, userId]);

        res.json({
            result: "success",
            users: users
        });
    } catch (error) {
        console.error("사용자 검색 에러:", error);
        res.status(500).json({
            result: "error",
            message: "사용자 검색 중 오류가 발생했습니다."
        });
    }
});

module.exports = router;

