import { Router } from "express"
import * as productsControllers from "#features/products/controllers/products.controllers.js"
const router = Router();

router.get("/", productsControllers.getProductsPage)
router.get("/status", productsControllers.getAllProductsStatus)
router.delete("/:product_id", productsControllers.deleteProduct)
router.patch("/:product_id", productsControllers.updateProduct)
router.post("/", productsControllers.createProduct)

export default router;
