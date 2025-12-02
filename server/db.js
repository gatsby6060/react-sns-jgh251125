const mysql = require('mysql2');
require("dotenv").config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    // password: 'test1234',
    password :  process.env.pwpw,
   
    database: 'mysqldb' // db 이름
});

// promise 기반으로 사용할 수 있게 변환
const promisePool = pool.promise();
module.exports = promisePool;