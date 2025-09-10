import { Router } from "express"
import swaggerUi from 'swagger-ui-express';
import productsRoutes from "#features/products/routes/products.routes.js"
import authRoutes from "#features/auth/routes/auth.routes.js"
import categoriesRoutes from "#features/categories/routes/categories.routes.js"
import api_doc from "../../docs/api-doc.json" with {type: "json"}

const customCss = `
    .info {
        text-align:right;
    }
    ul li {
        padding-top: 15px;
    }
    ul li::marker {
      content: "";
    }

`
// Swagger UI setup
const swaggerOptions = {
    swaggerOptions: {
        showRequestDuration: true
    },
    customSiteTitle: "مُختصِر | وثائق المبرمجين",
    customCss
};

const router = Router();

// The endpoints Doc
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(api_doc, swaggerOptions));

// The routes
router.use("/products", productsRoutes)
router.use("/categories", categoriesRoutes)
router.use("/auth", authRoutes)

export default router;
