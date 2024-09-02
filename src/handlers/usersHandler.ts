import { Request, Response } from "express-serve-static-core";
import { pool } from "../index";
import { createRequest } from "../dtos/user/CreateUser.dto";
import userSchema from "../validation/userSchema";
import { QueryResult } from "pg";
//* Varför står det att SearchQuery ska vara i types-mappen och inte i dto?
import { SearchQuery } from "../dtos/user/GetUserByQuery.dto";
import { User } from "../types/user/UserInterface";

type ResponseUser = User[] | string;

const getAllUsers = async (
  req: Request<{}, {}, {}, SearchQuery>,
  res: Response<ResponseUser>
) => {
  try {
    const { email, name } = req.query;

    let queryText: string;
    const values: (string | undefined)[] = [];

    //* Hur kan man göra detta smidigare om man har flera sökparametrar???
    if (name && email) {
      queryText = 'SELECT * FROM "user" WHERE name LIKE $1 AND email LIKE $2';
      values.push(`${name}%`, `${email}%`);
    } else if (name) {
      queryText = 'SELECT * FROM "user" WHERE name LIKE $1';
      values.push(`${name}%`);
    } else if (email) {
      queryText = 'SELECT * FROM "user" WHERE email LIKE $1';
      values.push(`${email}%`);
    } else {
      queryText = 'SELECT * FROM "user"';
    }
    // if we need to have a combined search result use: SELECT * FROM "user" WHERE name LIKE $1 AND email LIKE $2

    const results: QueryResult<User> = await pool.query(queryText, values);

    if (results.rowCount === 0) {
      return res.status(404).send("No users found...");
    }

    return res.status(200).json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data....");
  }
};

const getUserById = async (
  req: Request<{ id: number }>,
  res: Response<ResponseUser>
) => {
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
};

// const getUserByQuery = async ((req: Request<{}, {}, {}, { QUERY TYPE????}>, res: Response) => {

// })

const createUser = async (
  req: Request<{}, {}, createRequest>,
  res: Response<ResponseUser>
) => {
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
};

const updateUser = async (
  req: Request<{ id: number }, {}, createRequest>,
  res: Response<ResponseUser>
) => {
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
};

const deleteUser = async (
  req: Request<{ id: number }>,
  res: Response<ResponseUser>
) => {
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
};
export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
