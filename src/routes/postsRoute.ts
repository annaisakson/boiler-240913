import { Router } from "express";
import { Request } from "express-serve-static-core";
import { pool } from "../index";
import { createRequest } from "../dtos/CreatePost.dto";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const results = await pool.query("SELECT * FROM post");

    if (results.rowCount === 0) {
      return res.status(404).send("No posts found...");
    }

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
});

router.get("/:id", async (req: Request<{ id: number }>, res) => {
  const { id } = req.params;
  try {
    const results = await pool.query("SELECT * FROM post WHERE id = $1", [id]);

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
});

router.post("/", async (req: Request<{}, {}, createRequest>, res) => {
  const { user_id, title, content, post_date } = req.body;
  try {
    const results = await pool.query(
      "INSERT INTO post(user_id, title, content, post_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, content, post_date]
    );

    res.status(201).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while trying to add a new post");
  }
});

router.put(
  "/:id",
  async (req: Request<{ id: number }, {}, createRequest>, res) => {
    const { id } = req.params;
    const { user_id, title, content, post_date } = req.body;
    try {
      const results = await pool.query(
        "UPDATE post SET user_id = $1, title =$2, content =$3, post_date =$4 WHERE id= $5 RETURNING *",
        [user_id, title, content, post_date, id]
      );

      res.status(200).json(results.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occured while updating post");
    }
  }
);

router.delete("/:id", async (req: Request<{ id: number }>, res) => {
  const { id } = req.params;
  try {
    const results = await pool.query("DELETE from post WHERE id=$1", [id]);

    if (results.rowCount === 0) {
      return res.status(404).send(`No post with id:${id} found`);
    }
    res.status(200).send(`Post with id:${id} has been deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while trying to delete post");
  }
});

export default router;
