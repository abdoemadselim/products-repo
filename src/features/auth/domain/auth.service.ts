import { createHash } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

// TODO: The authentication feature depends on the user feature (Is this acceptable?)
import userRepository from "#features/user/data-access/user.repository.js";
import authRepository from "#features/auth/data-access/auth.repository.js";
import type { NewUserType } from "#features/auth/domain/auth.schemas.js";
import { LoginException } from "#features/auth/domain/error-types.js";

import {
    ResourceExpiredException,
    UnAuthorizedException,
    ValidationException,
} from "#lib/error-handling/error-types.js";

// import { sendVerificationMail } from "#lib/email/email.js";
import { client as redisClient } from "#lib/db/redis-connection.js";

// TODO: Consider creating a new type instead of omitting `password_confirmation` everywhere.
export async function createUser({
    email,
    password,
    name,
}: Omit<NewUserType, "password_confirmation">) {
    const isPwned = await isPasswordPwned(password);
    if (isPwned) {
        throw new ValidationException({
            password: {
                message:
                    "This password has appeared in known data breaches and may be unsafe to use. Please choose a different password.",
            },
        });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    if (!passwordHash) throw new Error();

    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        throw new ValidationException({
            email: { message: "An account with this email address already exists." },
        });
    }

    const user = await authRepository.createUser({ name, email, password: passwordHash });

    return {
        name: user.name,
        email: user.email,
        verified: true,
        id: user.id,
    };
}

/**
 * Checks whether a given password has been exposed in known data breaches.
 * This function uses the Have I Been Pwned API.
 * API Docs: https://haveibeenpwned.com/API/v3
 */
async function isPasswordPwned(password: string): Promise<boolean> {
    // Hash the password using SHA-1
    const hashAlgo = createHash("sha1");
    const passwordHash = hashAlgo.update(password).digest("hex").toUpperCase();

    // The API only requires the first 5 characters of the hash
    // (this preserves user privacy since the full hash is never sent)
    const passwordPrefix = passwordHash.slice(0, 5);
    const passwordSuffix = passwordHash.slice(5);

    const responseText = await fetch(
        `https://api.pwnedpasswords.com/range/${passwordPrefix}`
    ).then((res) => res.text());

    // Returns true if the full hash appears in the list of breached passwords
    const isPwned = responseText.split("\n").some((hash) => {
        const [hashSuffix] = hash.trim().split(":");
        return hashSuffix === passwordSuffix;
    });

    return isPwned;
}

/**
 * Verifies a user’s email address using a signed JWT token.
 * If the token is valid and not expired, the user’s account is marked as verified.
 */
export async function verifyEmail({
    token,
    sessionId,
}: {
    token: string;
    sessionId?: string;
}) {
    let decodedToken = null;
    try {
        decodedToken = jwt.verify(
            token,
            process.env.EMAIL_VERIFICATION_SECRET_KEY as string
        ) as JwtPayload;
        // TODO: Implement a way for users to request a new verification link.
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new ResourceExpiredException("This verification link has expired.");
        }

        throw new Error();
    }

    const user = await userRepository.getUserById(decodedToken.userId);

    if (!user) {
        return;
    }

    await authRepository.setUserVerified(user.id);

    if (sessionId) {
        await redisClient.setEx(
            `sessions:${sessionId}`,
            Number(process.env.SESSION_DURATION) / 1000,
            JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                verified: true,
            })
        );
    }

    return user;
}

/**
 * Logs a user in by validating the provided credentials.
 * If successful, returns basic user info.
 */
export async function login({ email, password }: { email: string; password: string }) {
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
        throw new LoginException();
    }

    const isValid = await bcrypt.compare(password, user.password as string);
    if (!isValid) {
        throw new LoginException();
    }

    return {
        name: user.name,
        email: user.email,
        verified: user.verified,
        id: user.id,
    };
}

/**
 * Express middleware that authenticates requests based on a session cookie.
 * If the session is valid and found in Redis, the user is attached to the request object.
 */
export function authSession() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const sessionId = req.cookies[process.env.AUTH_SESSION_NAME as string];

        // No cookie → not authenticated
        if (!sessionId) {
            throw new UnAuthorizedException();
        }

        const session = await redisClient.get(`sessions:${sessionId}`);

        // Session not found or expired
        if (!session) {
            res.clearCookie(process.env.AUTH_SESSION_NAME as string, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });

            throw new UnAuthorizedException();
        }

        const user = JSON.parse(session as string);

        // Attach user info to the request object
        // @ts-ignore
        req.user = {
            name: user.name,
            email: user.email,
            verified: user.verified,
            id: user.id,
        };

        next();
    };
}
