import { Context, MiddlewareHandler } from "hono";
import { CloudflareBindings } from "./common/cloudflare";
import { ErrorCodes } from "./common/errors";
import { verifyJWT } from "./common/jwt";


export async function middlewareVerifyJWT(required:Boolean = true): Promise<MiddlewareHandler> {
    return async (c: Context<{ Bindings: CloudflareBindings; }>, next) => {
        const authorization = (c.req.raw.headers.get('Authorization') || '').replaceAll(/\s+/g, ' ');
        const tokenParts = authorization.split(' ')
        if (tokenParts.length !== 2) {
            if (required) {
                console.warn('Invalid JWT token, length !== 2', authorization);
                return c.json({ error: 'Invalid JWT token', code: ErrorCodes.InvalidJWT }, 401);
            }

            // Not required
            await next();
            return;
        }

        const token = tokenParts[1].trim();
        try {
            const payload = await verifyJWT(token, c.env.JWT_SECRET_KEY);

            // @ts-expect-error
            c.set('jwtPayload', payload)

            // @ts-expect-error
            c.set('accountId', parseInt(payload.sub!, 10));
        } catch (error) {
            if (!required) {
                // Not required
                await next();
                return;
            }

            // Invalid JWT is not acceptable
            console.warn('Invalid JWT token, verification failed', error);
            return c.json({ error: 'Invalid JWT token', code: ErrorCodes.InvalidJWT }, 401);
        }

        await next();
    }
}