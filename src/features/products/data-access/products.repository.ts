import { query } from "#lib/db/db-config.js";
import { ProductType } from "../types.js";

const productRepository = {
    async getProductsPage({ page, page_size, search }: { page: number, page_size: number, search: string }) {
        const offset = page * page_size;

        // Check if search is empty or just whitespace
        const hasSearch = search && search.trim().length > 0;

        let products_result;
        let total_pages_result;
        let search_words = search.trim().split(" ").join("|");

        if (hasSearch) {
            // Query with search
            products_result = query(
                `
              SELECT product.id as id, product.name as name, category.name as category, created_at, stock, status, price, description
              FROM product JOIN category
              ON product.category_id = category.id
              WHERE search_vector @@ to_tsquery('arabic', $1)
              ORDER BY created_at DESC
              OFFSET $2 LIMIT $3;
            `,
                // @ts-ignore
                [search_words, offset, page_size]
            );

            total_pages_result = query(
                `
              SELECT COUNT(*) as total 
              FROM product JOIN category
              ON product.category_id = category.id
              WHERE search_vector @@ to_tsquery('arabic', $1)
            `,
                [search_words]
            );
        } else {
            // Query without search - get all products
            products_result = query(
                `
              SELECT product.id as id, product.name as name, category.name as category, created_at, stock, status, price, description
              FROM product JOIN category
              ON product.category_id = category.id
              ORDER BY created_at DESC
              OFFSET $1 LIMIT $2;
            `,
                // @ts-ignore
                [offset, page_size]
            );

            total_pages_result = query(
                "SELECT COUNT(*) as total FROM product"
            );
        }

        const result = await Promise.all([products_result, total_pages_result]);
        return { products: result[0].rows, total: Number(result[1].rows[0].total) };
    },

    async deleteProduct(product_id: number) {
        const result = await query(
            `DELETE FROM product
             WHERE id = $1
            `,
            // @ts-ignore
            [product_id]
        );

        return result.rows[0];
    },

    async getProductById(product_id: number) {
        const result = await query(
            `SELECT name FROM product 
             WHERE id = $1`,
            // @ts-ignore
            [product_id]
        )

        return result.rows[0];
    },

    async updateProduct(product_id: number, product_data: Partial<ProductType>) {
        const categoryResults = await query(
            `
                SELECT id as category_id FROM category 
                WHERE name = $1
            `,
            [product_data.category]
        )

        const category_id = categoryResults.rows[0].category_id;
        const result = await query(
            `UPDATE product
             SET name = $1, price = $2, category_id = $3, stock = $4, status = $5, description = $6
             WHERE id = $7
             RETURNING id`,
            // @ts-ignore
            [product_data.name, product_data.price, category_id, product_data.stock, product_data.status, product_data.description, product_id]);

        return result.rows[0];
    },

    async getAllProductsStatus() {
        const result = await query(`
               SELECT name as status
               FROM status
            `)
        return result.rows;
    },

    async createProduct(product: Partial<ProductType>) {
        const {
            name, category, description, price, stock, status
        } = product;

        const categoryResults = await query(
            `
                SELECT id as category_id FROM category 
                WHERE name = $1
            `,
            [category]
        )

        let result;
        if (categoryResults.rows.length) {
            const category_id = categoryResults.rows[0].category_id;
            result = await query(
                `
                INSERT INTO product(name, category_id, description, price, stock, status)
                VALUES($1, $2, $3, $4, $5, $6);
                `,
                // @ts-ignore
                [name, category_id, description, price, stock, status]
            )
        }

        return result.rows[0]
    }

}


export default productRepository