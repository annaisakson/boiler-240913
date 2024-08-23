import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import usersRoute from "./routes/usersRoute";
import postsRoute from "./routes/postsRoute";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
const PORT = process.env.PORT ? process.env.PORT : 3030;

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
});

app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);

app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}. http://localhost:${PORT}`);
});
