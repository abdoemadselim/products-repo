import { Router } from "express"
import * as productsControllers from "#features/products/controllers/products.controllers.js"
import { authSession } from "#features/auth/domain/auth.service.js"
import { productSchema } from "#features/products/domain/products.schema.js";

import validateRequest from "#lib/validation/validator-middleware.js";

const router = Router();

router.get("/", authSession(), productsControllers.getProductsPage)
router.get("/status", authSession(), productsControllers.getAllProductsStatus)
router.delete("/:product_id", authSession(), productsControllers.deleteProduct)
router.patch("/:product_id", authSession(), validateRequest([productSchema]), productsControllers.updateProduct)
router.post("/", authSession(), validateRequest([productSchema]), productsControllers.createProduct)

export default router;
