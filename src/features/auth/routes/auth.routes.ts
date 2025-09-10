import { Router } from "express"
import { login, logout, signup, verifyUser } from "#features/auth/controllers/auth.controllers.js";
import { loginSchema, newUserSchema } from "#features/auth/domain/auth.schemas.js";

import validateRequest from "#lib/validation/validator-middleware.js";

const router = Router()

router.post("/login", validateRequest([loginSchema]), login)
router.post("/logout", logout)
router.post("/signup", validateRequest([newUserSchema]), signup)
router.get("/me", verifyUser)

export default router; 