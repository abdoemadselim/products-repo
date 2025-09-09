import type { Request, Response } from "express";
import * as categoriesService from "#root/features/categories/service/categories.service.js";
import { NoException, ValidationException } from "#lib/error-handling/error-types.js";
import { log, LOG_TYPE } from "#root/lib/logger/logger.js";

export async function getCategories(req: Request, res: Response) {
    const start = Date.now();
    
    //2- pass the data to the service
    const categories = await categoriesService.getCategories()

    //3- prepare the response
    const response = {
        data: {
            categories
        },
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString
    }

    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "Get All Categories",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
    })
    res.json(response)
}
