import categoryRepository from "#features/categories/data-access/categories.repository.js";
import { NotFoundException } from "#root/lib/error-handling/error-types.js";

export async function getCategories() {
    const categories = await categoryRepository.getCategories();
    return categories;
}