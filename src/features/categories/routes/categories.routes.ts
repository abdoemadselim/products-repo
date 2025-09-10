import { Router } from "express"
import * as categoriesControllers from "#features/categories/controllers/categories.controllers.js"
import { authSession } from "#features/auth/domain/auth.service.js"
const router = Router();

router.get("/", authSession(), categoriesControllers.getCategories)

export default router;
