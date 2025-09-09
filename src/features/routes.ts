import { Router } from "express"
import productsRoutes from "#features/products/routes/products.routes.js"
import authRoutes from "#features/auth/routes/auth.routes.js"
const router = Router();

router.use("/products", productsRoutes)
router.use("/auth", authRoutes)

export default router;
