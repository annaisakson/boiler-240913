import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import usersRoute from "./routes/usersRoute";
import postsRoute from "./routes/postsRoute";
import helmet from "helmet";
import cookieParser from "cookie-parser";
const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
const PORT = process.env.PORT ? process.env.PORT : 3030;

const { Pool } = pg;

//* Many custom options are avaible for helmet:
// This sets custom options for the
// Content-Security-Policy header.
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "script-src": ["'self'", "example.com"],
//       },
//     },
//   })
// );

// export const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
// });

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(cookieParser("alexanderisthebest"));
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);

app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}. http://localhost:${PORT}`);
});
