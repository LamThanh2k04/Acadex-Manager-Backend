import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"; 

dotenv.config();

const app = express();


const PORT = process.env.PORT || 8800; 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from server Acadex Manager!");
});

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
});
