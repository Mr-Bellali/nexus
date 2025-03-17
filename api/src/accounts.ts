import { OpenAPIHono, z } from "@hono/zod-openapi";
import { CloudflareBindings } from "./common/cloudflare";
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { getPrismaClient } from "./common/prisma";
import { Account } from "@prisma/client";
import { Context } from "hono";
import { JWTPayload, SignJWT } from 'jose';
import { ErrorCodes } from "./common/errors";


export const accountFormSchema = z.object({
    username: z.string().min(5).max(13),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This will highlight the confirmPassword field on error
});

async function generateSignedJWT(account: Account, c: Context<{ Bindings: CloudflareBindings; }>): Promise<string> {
    const Claims: Record<string, any> = {
        accountId: account.id,
    }

    const secret = c.env.JWT_SECRET_KEY;
    const jsecret = new TextEncoder().encode(secret);
    return await new SignJWT(Claims)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(('7d'))
        .setSubject(account.id.toString())
        .sign(jsecret);
}

export function setupAuthApi(api: OpenAPIHono<{ Bindings: CloudflareBindings }>) {
    // Register 
    api.post('/auth/register',
        zValidator('json', accountFormSchema),
        async (c) => {
            const { username, firstName, lastName, password } = c.req.valid('json')
            const prisma = getPrismaClient(c);
            const hash = await bcrypt.hash(password, 10);
            try {
                const account = await prisma.account.create({
                    data: {
                        username,
                        firstName,
                        lastName,
                        hashedPassword: hash
                    }
                })

                // Generate a JWT token
                const token = await generateSignedJWT(account, c);

                return c.json({
                    user:
                    {
                        account,
                        token
                    }
                }, 201);
            } catch (error: any) {
                if (error.code === 'P2002') {
                    return c.json({ error: 'Username already used', code: ErrorCodes.AlreadyUsed }, 409);
                }
                throw error;
            }

        }
    )

    // Login
    api.post('/auth/login',
        zValidator('json', z.object({
            username: z.string().min(5),
            password: z.string().min(8)
        })),
        async (c) => {
            const { username, password } = c.req.valid('json');
            const prisma = getPrismaClient(c);
            const account = await prisma.account.findFirst({
                where: {
                    username
                }
            });
            if (!account) {
                return c.json({ error: 'Invalid credentials', code: ErrorCodes.BadAuth }, 401);
            }

            // Verify the password
            const valid = await bcrypt.compare(password, account.hashedPassword);
            if (!valid) {
                return c.json({ error: 'Invalid credentials', code: ErrorCodes.BadAuth }, 401)
            }

            // Generate JWT token
            const token = await generateSignedJWT(account, c);

            const neededAccount = {
                id: account.id,
                username: account.username,
                firstName: account.firstName,
                lastName: account.lastName,
            }

            return c.json({
                user: {
                    account: neededAccount,
                    token
                }
            })
        }
    )
}