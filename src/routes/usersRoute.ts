import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  // getUserByQuery,
} from "../handlers/usersHandler";

const router = Router();

router.get("/", getAllUsers);

router.get("/:id", getUserById);

// router.get("/", getUserByQuery);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
