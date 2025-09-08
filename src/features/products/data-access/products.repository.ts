import { query } from "#lib/db/db-config.js";
import { ProductType } from "../types.js";

const productRepository = {
    async getProductsPage({ page, page_size }: { page: number, page_size: number }) {
        const offset = page * page_size;
        const products_result = query(
            `
              SELECT product.id as id, product.name as name, category.name as category, stock, status, price, added_at, description
              FROM product JOIN category
              ON product.category_id = category.id
              ORDER BY created_at DESC
              OFFSET $1 LIMIT $2
            `,
            // @ts-ignore
            [offset, page_size]
        )

        const total_pages_result = query(
            "SELECT COUNT(*) as total FROM product",
        )

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
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        for (const key of Object.keys(product_data)) {
            // @ts-ignore
            if (product_data[key] !== undefined) {
                fields.push(`${key} = $${i}`);
                // @ts-ignore
                values.push(product_data[key]);
                i++;
            }
        }

        values.push(product_id);

        const result = await query(
            `UPDATE product
            SET ${fields.join(", ")}
            WHERE id = $${i}
            RETURNING id`, values);

        return result.rows[0];
    }

}


export default productRepository