import { Router } from "express"
import productsRoutes from "#features/products/routes/products.routes.js"
const router = Router();

router.use("/products", productsRoutes)

export default router;
