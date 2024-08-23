import { Router } from "express";
import { Request } from "express-serve-static-core";
import { pool } from "../index";
import userSchema from "../validation/userSchema";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM "user"');

    if (results.rowCount === 0) {
      return res.status(404).send("No users found...");
    }

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
});

interface IdRequest {
  id: number;
}

router.get("/:id", async (req: Request<IdRequest>, res) => {
  const { id } = req.params;
  try {
    // const results = await pool.query(`SELECT * FROM "user" WHERE id=${id}`);

    const results = await pool.query('SELECT * FROM "user" WHERE id = $1', [
      id,
    ]);

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
});

interface createRequest {
  name: string;
  email: string;
}

router.post("/", async (req: Request<{}, {}, createRequest>, res) => {
  const { name, email } = req.body;

  try {
    //*Varför är detta sätt sämre???
    // const results = await pool.query(
    //   `INSERT INTO "user" (name, email) VALUES (${name}, ${email}) RETURNING *`
    // );
    const validationResult = userSchema.validate({ email: email });
    if (validationResult.error) {
      throw new Error(validationResult.error.details[0].message);
    }
    const results = await pool.query(
      'INSERT INTO "user" (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    res.status(201).json(results.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(`An error occured while trying to add new user: ${error}`);
  }
});

router.put("/:id", async (req: Request<IdRequest, {}, createRequest>, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const results = await pool.query(
      'UPDATE "user" SET name = $1, email =$2 WHERE id= $3 RETURNING *',
      [name, email, id]
    );

    res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while updating user");
  }
});

router.delete("/:id", async (req: Request<IdRequest>, res) => {
  const { id } = req.params;
  try {
    const results = await pool.query('DELETE from "user" WHERE id=$1', [id]);

    if (results.rowCount === 0) {
      return res.status(404).send(`No user with id:${id} found`);
    }
    res.status(200).send(`User with id:${id} has been deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occured while trying to delete user");
  }
});

export default router;
