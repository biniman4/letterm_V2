import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;