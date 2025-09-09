import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";

import type { NewUserType } from "#features/auth/domain/auth.schemas.js"; 
import * as authService from "#features/auth/domain/auth.service.js"

import { client as redisClient } from "#lib/db/redis-connection.js"
import { NoException, UnAuthorizedException } from "#lib/error-handling/error-types.js";
import { log, LOG_TYPE } from "#lib/logger/logger.js";

// ---------------------- LOGIN ----------------------
export async function login(req: Request, res: Response) {
    const start = Date.now();

    // Validate the data
    const { email, password } = req.body as { email: string, password: string };
    const user = await authService.login({ email, password })

    // @ts-ignore
    req.user = user;

    const sessionId = randomUUID()
    res.cookie(process.env.AUTH_SESSION_NAME as string, sessionId, {
        maxAge: Number(process.env.SESSION_DURATION),
        httpOnly: true,
        secure: true,
        sameSite: "lax"
    });

    redisClient.setEx(
        `sessions:${sessionId}`,
        Number(process.env.SESSION_DURATION) / 1000,
        JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified
        }))

    const response = {
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
        data: {
            user: {
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        }
    };

    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "User login",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
        userEmail: email // ✅ safe to log email (not password!)
    });

    res.json(response);
}

// ---------------------- REGISTER ----------------------
export async function signup(req: Request, res: Response) {
    const start = Date.now();
    const { email, password, name } = req.body as NewUserType;
    const user = await authService.createUser({ email, password, name })

    // @ts-ignore
    req.user = user

    const sessionId = randomUUID()
    // httpOnly: so even if a malicious script managed to land on our server, it can't access the cookie
    // secure: so the session is only sent over HTTPS (anyway, the server runs only over HTTPS)
    // sameSite: lax (default value): to prevent CSRF attacks (attackers do something on behalf of users because the user's cookie is sent with the malicious request)
    res.cookie(process.env.AUTH_SESSION_NAME as string, sessionId, {
        maxAge: Number(process.env.SESSION_DURATION),
        httpOnly: true,
        secure: true,
        sameSite: "lax"
    });

    redisClient.setEx(
        `sessions:${sessionId}`,
        Number(process.env.SESSION_DURATION) / 1000,
        JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            verified: false
        })
    );

    const response = {
        errors: [],
        data: {
            user: {
                name: user.name,
                email: user.email,
                isVerified: true
            }
        },
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
    };

    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "User registered",
        path: req.originalUrl,
        status: 201,
        durationMs,
        userEmail: email
    });

    res.status(201).json(response)
}

// ---------------------- VERIFY EMAIL ----------------------
export async function verify(req: Request, res: Response) {
    const start = Date.now();

    const { token } = req.query as { token: string };
    const sessionId = req.cookies[process.env.AUTH_SESSION_NAME as string];
    const session = await redisClient.get(`sessions:${sessionId}`)

    // User Email is already verified
    if (session) {
        const user = JSON.parse(session as string);
        if (user.verified) {
            const durationMs = Date.now() - start;

            log(LOG_TYPE.INFO, {
                message: "Email already verified",
                method: req.method,
                path: req.originalUrl,
                status: 200,
                durationMs,
                userEmail: user.email
            });

            res.redirect(process.env.WEB_URL as string)
        }
    }

    const user = await authService.verifyEmail({ token, sessionId })

    if (!user) {
        res.clearCookie(process.env.AUTH_SESSION_NAME as string, {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });
    }

    const durationMs = Date.now() - start;

    log(LOG_TYPE.INFO, {
        message: "Email verified",
        method: req.method,
        path: req.originalUrl,
        status: 200,
        durationMs,
        userEmail: user?.email
    });

    res.redirect(process.env.WEB_URL as string)
}

export async function logout(req: Request, res: Response) {
    const { sessionId } = req.cookies[process.env.AUTH_SESSION_NAME as string];
    if (sessionId) {
        redisClient.del(`session:${sessionId}`);
    }

    // Clear cookie on client
    res.clearCookie(process.env.AUTH_SESSION_NAME as string, {
        httpOnly: true,
        secure: true,
        sameSite: "lax"
    });

    const response = {
        errors: [],
        data: {},
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
    };

    return res.status(200).json(response);
}

// // ---------------------- FORGOT PASSWORD ----------------------
// export async function forgotPassword(req: Request, res: Response) {
//     const start = Date.now();
//     const { email } = req.body as { email: string };

//     const user = await authService.findUserByEmail(email);
//     if (!user) {
//         const durationMs = Date.now() - start;
//         const store = asyncStore.getStore();

//         log(LOG_TYPE.INFO, {
//             message: "Forgot password attempt for non-existent user",
//             requestId: store?.requestId,
//             method: req.method,
//             path: req.originalUrl,
//             status: 200,
//             durationMs,
//             tokenId: store?.tokenId,
//             userEmail: email
//         });

//         // Return generic response to avoid leaking user existence
//         return res.json({
//             errors: [],
//             data: {
//                 message: "If the email exists, a password reset link will be sent"
//             }
//         });
//     }

//     const resetToken = randomUUID();
//     const RESET_TOKEN_DURATION = 1000 * 60 * 60; // 1 hour
//     await redisClient.setEx(
//         `reset:${resetToken}`,
//         RESET_TOKEN_DURATION / 1000,
//         JSON.stringify({
//             email: user.email,
//             userId: user.id
//         })
//     );

//     await authService.sendPasswordResetEmail(user.email, resetToken);

//     const response = {
//         errors: [],
//         data: {
//             message: "If the email exists, a password reset link will be sent",
//             resetToken // Included for testing; in production, this would be sent via email
//         }
//     };

//     const durationMs = Date.now() - start;
//     const store = asyncStore.getStore();

//     log(LOG_TYPE.INFO, {
//         message: "Password reset requested",
//         requestId: store?.requestId,
//         method: req.method,
//         path: req.originalUrl,
//         status: 200,
//         durationMs,
//         tokenId: store?.tokenId,
//         userEmail: email
//     });

//     res.json(response);
// }

export async function verifyUser(req: Request, res: Response) {
    const sessionId = req.cookies[process.env.AUTH_SESSION_NAME as string];
    
    if (!sessionId) {
        throw new UnAuthorizedException()
    }

    const session = await redisClient.get(`sessions:${sessionId}`)

    if (!session) {
        res.clearCookie(process.env.AUTH_SESSION_NAME as string, {
            httpOnly: true,
            secure: true,
            sameSite: "lax"
        });

        throw new UnAuthorizedException()
    }

    const user = JSON.parse(session as string)
    const response = {
        errors: [],
        code: NoException.NoErrorCode,
        errorCode: NoException.NoErrorCodeString,
        data: {
            user: {
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        }
    };

    res.json(response);
}