import { query } from "#lib/db/db-config.js";

const categoryRepository = {
    async getCategories() {
        const result = await query(`
            SELECT id, name FROM category
        `)

        return result.rows;
    }
}


export default categoryRepository