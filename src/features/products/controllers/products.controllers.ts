import type { Request, Response } from "express";
import * as productsService from "#features/products/service/products.service.js";
import { NoException, ValidationException } from "#lib/error-handling/error-types.js";
import { log, LOG_TYPE } from "#root/lib/logger/logger.js";

export async function getProductsPage(req: Request, res: Response) {
    const start = Date.now();
    //1- prepare the data for the service
    const { page = 0, page_size = 10 } = req.query

    //2- pass the data to the service
    const { products, total } = await productsService.getProductsPage({ page: Number(page), page_size: Number(page_size) })

    //3- prepare the response
    const response = {
        data: {
            products,
            total
        },
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString
    }

    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "Get Products Page",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
    })
    res.json(response)
}

export async function deleteProduct(req: Request, res: Response) {
    const start = Date.now();
    // 1- prepare the data for the service
    const { product_id } = req.params;

    // 2- pass the prepared data to the service
    const product = await productsService.deleteProduct(Number(product_id))

    // 3- prepare the response
    const response = {
        data: product,
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
    }

    // TODO: Can't be abstracted?
    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "Delete Product",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
    })

    // 4- send the response
    res.json(response)
}

export async function updateProduct(req: Request, res: Response) {
    const start = Date.now();

    // 1- prepare the data for the service
    const { product_id } = req.params;
    const { name, category, stock, status, price, description } = req.body ;

    // 2- pass the prepared data to the service
    const product = {
        name,
        category,
        stock,
        status,
        price,
        description
    }

    const updated_product = await productsService.updateProduct(Number(product_id), product)

    // 3- prepare the response
    const response = {
        data: {
            updated_product
        },
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
    }

    // TODO: Can't be abstracted?
    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "Update Product",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
    })

    // 4- send the response
    res.json(response)
}