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
// app.get("/api/users", async (req, res) => {
//   try {
//     const results = await pool.query('SELECT * FROM "user"');

//     if (results.rowCount === 0) {
//       return res.status(404).send("No users found...");
//     }

//     res.status(200).json(results.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching data....");
//   }
// });

// interface IdRequest {
//   id: number;
// }

// app.get("/api/users/:id", async (req: Request<IdRequest>, res) => {
//   const { id } = req.params;
//   try {
//     // const results = await pool.query(`SELECT * FROM "user" WHERE id=${id}`);

//     const results = await pool.query('SELECT * FROM "user" WHERE id = $1', [
//       id,
//     ]);

//     res.status(200).json(results.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching data....");
//   }
// });

// interface createRequest {
//   name: string;
//   email: string;
// }

// app.post("/api/users", async (req: Request<{}, {}, createRequest>, res) => {
//   const { name, email } = req.body;
//   console.log(name);
//   try {
//     //*Varför är detta sätt sämre???
//     // const results = await pool.query(
//     //   `INSERT INTO "user" (name, email) VALUES (${name}, ${email}) RETURNING *`
//     // );

//     const results = await pool.query(
//       'INSERT INTO "user" (name, email) VALUES ($1, $2) RETURNING *',
//       [name, email]
//     );

//     res.status(201).json(results.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occured while trying to add new user");
//   }
// });

// app.put(
//   "/api/users/:id",
//   async (req: Request<IdRequest, {}, createRequest>, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;
//     try {
//       const results = await pool.query(
//         'UPDATE "user" SET name = $1, email =$2 WHERE id= $3 RETURNING *',
//         [name, email, id]
//       );

//       res.status(200).json(results.rows);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("An error occured while updating user");
//     }
//   }
// );

// app.delete("/api/users/:id", async (req: Request<IdRequest>, res) => {
//   const { id } = req.params;
//   try {
//     const results = await pool.query('DELETE from "user" WHERE id=$1', [id]);

//     if (results.rowCount === 0) {
//       return res.status(404).send(`No user with id:${id} found`);
//     }
//     res.status(200).send(`User with id:${id} has been deleted`);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occured while trying to delete user");
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}. http://localhost:${PORT}`);
});
