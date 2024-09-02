import { Request, Response } from "express-serve-static-core";
import { pool } from "../index";
import { createRequest } from "../dtos/post/CreatePost.dto";
import { QueryResult } from "pg";
//* Varför står det att SearchQuery ska vara i types-mappen och inte i dto?
import { SearchQuery } from "../dtos/post/GetPostByQuery.dto";
import { Post } from "../types/post/PostInterface";

type ResponsePost = Post[] | string;

const getAllPosts = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response<ResponsePost>
) => {
  try {
    const { user_id, title } = req.query;

    let queryText: string;
    const values: (string | number | undefined)[] = [];

    if (user_id && title) {
      //queryText = "SELECT * FROM post WHERE user_id = $1 AND title = $2";
      queryText = `
        SELECT "user".name, 
                post.id AS post_id, 
                post.title, 
                post.content, 
                post.post_date 
        FROM post 
        INNER JOIN "user" 
        ON post.user_id = "user".id 
        WHERE post.user_id = $1 
        AND post.title LIKE $2
    `;
      values.push(user_id, `${title}%`);
    } else if (user_id) {
      queryText = `
        SELECT "user".name, 
                post.id AS post_id, 
                post.title, 
                post.content, 
                post_date 
        FROM post 
        INNER JOIN "user" 
        ON post.user_id = "user".id 
        WHERE post.user_id = $1
      `;
      values.push(user_id);
    } else if (title) {
      queryText = "SELECT * FROM post WHERE title LIKE $1";
      values.push(`${title}%`);
    } else {
      queryText = "SELECT * FROM post";
    }

    const results: QueryResult<Post> = await pool.query(queryText, values);

    if (results.rowCount === 0) {
      return res.status(404).send("No posts found...");
    }

    return res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
};

const getPostById = async (
  req: Request<{ id: number }>,
  res: Response<ResponsePost>
) => {
  const { id } = req.params;
  try {
    // const results = await pool.query(`SELECT * FROM "user" WHERE id=${id}`);

    const results = await pool.query("SELECT * FROM post WHERE id = $1", [id]);

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
};

// const getUserByQuery = async ((req: Request<{}, {}, {}, { QUERY TYPE????}>, res: Response) => {

// })

const createPost = async (
  req: Request<{}, {}, createRequest>,
  res: Response<ResponsePost>
) => {
  const { user_id, title, content, post_date } = req.body;

  try {
    // const validationResult = userSchema.validate({ email: email });
    // if (validationResult.error) {
    //   throw new Error(validationResult.error.details[0].message);
    // }
    const results = await pool.query(
      "INSERT INTO post (user_id, title, content, post_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, title, content, post_date]
    );

    res.status(201).json(results.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`An error occured while trying to add new post: ${error}`);
  }
};

const updatePost = async (
  req: Request<{ id: number }, {}, createRequest>,
  res: Response<ResponsePost>
) => {
  const { id } = req.params;
  const { user_id, title, content, post_date } = req.body;
  try {
    const results = await pool.query(
      "UPDATE post SET user_id = $1, title =$2, content = $3, post_date = $4 WHERE id= $5 RETURNING *",
      [user_id, title, content, post_date, id]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while updating post");
  }
};

const deletePost = async (
  req: Request<{ id: number }>,
  res: Response<ResponsePost>
) => {
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
};
export { getAllPosts, getPostById, createPost, updatePost, deletePost };
