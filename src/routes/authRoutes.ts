import { Router } from "express";
import {
  register,
  login,
  logout,
  updateUser,
  deleteUser,
  updatePassword,
} from "../controllers/authController";
import protect from "../middleware/authMiddleware";

const router = Router();


router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);


router.put("/user/:id/password", protect, updatePassword);
router.put("/user/:id", protect, updateUser);
router.delete("/user/:id", protect, deleteUser);

export default router;
