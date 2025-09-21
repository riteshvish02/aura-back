const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const {generatedError} = require("./middlewares")
const {ErrorHandler} = require("./utils")
const cors = require("cors")
const PORT = 3001;
// Database connection
require("./config").DB.connectdb()
const fileupload = require("express-fileupload");
const User = require("./models/user.js");
app.use(fileupload())
//body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors(
    {
        origin:process.env.CLIENT_URL,
        credentials: true,
    }
))

// routes
app.use("/api", require("./routes"));



// Error Handling middleware
app.use(generatedError)

 // userName: "Editor",
 // email: "editor@wjaps.com",
 // password: "1994@Wjaps",
        // role: "admin"

app.listen(PORT, async() => {
//    await User.create({
//         userName: "Editor",
//         email: "editor@wjaps.com",
//         password: "1994@Wjaps",
//         role: "admin"
//     });
    console.log(`Server is running on port ${process.env.PORT}`);
});
