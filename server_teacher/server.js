const express = require('express')
const cors = require('cors')
const path = require('path');
const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");

const app = express()
app.use(cors({
    // origin: ["http://192.168.30.45:5500","http://192.168.30.45:5501"], //여기서 들어오는건 안막겠다는 뜻
    origin: "*", //모조리 안막겟다
    credentials: true
}))
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname,"uploads")) );

//라우터 영역
app.use("/user", userRouter);
app.use("/feed", feedRouter);



app.listen(3010, () => {
    console.log("server start!");
})