import { Router } from "express"
import * as categoriesControllers from "#features/categories/controllers/categories.controllers.js"
const router = Router();

router.get("/", categoriesControllers.getCategories)

export default router;
