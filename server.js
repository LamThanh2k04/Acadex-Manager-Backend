import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"; 
import { errorHandler } from './src/common/middlewares/errorHandler.js';
import router from './src/routers/index.js';
import { initSocket } from './src/socket/socket.js';
import http from 'http';
dotenv.config();

const app = express();


const PORT = process.env.PORT || 8800; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.get("/", (req, res) => {
  res.send("Hello from server Acadex Manager!!");
});


app.use(router);
app.use(errorHandler)
const server = http.createServer(app)
initSocket(server)
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
});
