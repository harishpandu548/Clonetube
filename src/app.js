import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
  origin: "https://clonetube-frontend.vercel.app",
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send("Clonetube Backend is running ");
});

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

// user router
import router from "./routes/user.routes.js"
app.use("/api/v1/users",router)

// video router
import videoRouter from "./routes/videosRouter.routes.js"
app.use("/api/v1/videos", videoRouter)

// subscription router
import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/api/v1/subscriptions", subscriptionRouter)

//comment router
import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments", commentRouter)

//like router
import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes",likeRouter) 

// dashboard router
import dashboardRouter from "./routes/dashboardrouter.routes.js"
app.use("/api/v1/dashboard",dashboardRouter)

import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/playlists",playlistRouter)

export {app}