import dotenv from "dotenv";
import dbConnection from "./db/index.js";
import { app } from "./app.js"; //  Use this one!

// this step was important bcz when app runs the first file running is index.js as we made in package.josn as index.js as entry file so when this loads we try to load env varaibles as soon as possible to get available for others
dotenv.config({
    path:"./.env"
})


// db connection
dbConnection().then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log("server running at port ",process.env.PORT)
    })

}).catch((error)=>{
    console.log("db connection error",error)
})