import { query } from "#lib/db/db-config.js";
import { ProductType } from "../types.js";

const productRepository = {
    async getProductsPage({ page, page_size, search, sortBy, sortOrder }: { page: number, page_size: number, search: string, sortBy: string, sortOrder: string }) {
        const offset = page * page_size;

        // Check if search is empty or just whitespace
        const hasSearch = search && search.trim().length > 0;

        let products_result;
        let total_pages_result;
        let search_words = search.trim().split(" ").join("|");

        const validSortColumns = ['product_name', 'price', 'created_at', 'stock', 'sales', 'category_name'];
        const validSortOrders = ['asc', 'desc'];

        const sortBySafe = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortOrderSafe = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder : 'desc';

        if (hasSearch) {
            // Query with search
            products_result = query(
                `
              SELECT product.id as id, product.name as product_name, category.name as category_name, created_at, stock, sales, price, description
              FROM product JOIN category
              ON product.category_id = category.id
              WHERE search_vector @@ to_tsquery('english', $1)
              ORDER BY ${sortBySafe} ${sortOrderSafe}
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
              WHERE search_vector @@ to_tsquery('english', $1)
            `,
                [search_words]
            );
        } else {
            // Query without search - get all products
            products_result = query(
                `
              SELECT product.id as id, product.name as product_name, category.name as category_name, created_at, stock, sales, price, description
              FROM product JOIN category
              ON product.category_id = category.id
              ORDER BY ${sortBySafe} ${sortOrderSafe}
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
             SET name = $1, price = $2, category_id = $3, stock = $4, sales = $5, description = $6
             WHERE id = $7
             RETURNING id`,
            // @ts-ignore
            [product_data.name, product_data.price, category_id, product_data.stock, product_data.sales, product_data.description, product_id]);

        return result.rows[0];
    },

    async createProduct(product: Partial<ProductType>) {
        const {
            name, category, description, price, stock, sales
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
                INSERT INTO product(name, category_id, description, price, stock, sales)
                VALUES($1, $2, $3, $4, $5, $6);
                `,
                // @ts-ignore
                [name, category_id, description, price, stock, sales || 0]
            )
        }

        return result.rows[0]
    }

}


export default productRepository
