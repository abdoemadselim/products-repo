import productRepository from "#features/products/data-access/products.repository.js";
import { NotFoundException } from "#root/lib/error-handling/error-types.js";
import { ProductType } from "../types.js";

export async function getProductsPage({ page, page_size, search }: { page: number, page_size: number, search: string }) {
    const products = await productRepository.getProductsPage({ page, page_size, search });
    return products;
}

export async function deleteProduct(product_id: number) {
    const product = await productRepository.deleteProduct(product_id)
    return product;
}

export async function updateProduct(product_id: number, toUpdateProductData: Partial<ProductType>) {
    //1. Check if the Product even exists to update
    const product = await productRepository.getProductById(product_id);
    if (!product) {
        throw new NotFoundException("لا يوجد مُنتج.");
    }

    // 2. Update the existing product
    const result = await productRepository.updateProduct(product_id, toUpdateProductData)

    return result;
}

export async function createProduct(product: Partial<ProductType>) {
    // 2. Update the existing product
    const result = await productRepository.createProduct(product)
    return result;
}
