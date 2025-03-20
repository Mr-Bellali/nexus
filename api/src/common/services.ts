import { Context } from 'hono';
import { CloudflareBindings } from './cloudflare';
import { getPrismaClient } from './prisma';


export async function searchUsers(env: CloudflareBindings, query: string, id: number) {
    const ctx = { env } as Context<{ Bindings: CloudflareBindings }>;
    const prisma = getPrismaClient(ctx);

    const users = await prisma.account.findMany({
        where: {
            NOT: { id },
            OR: [
                { username: { startsWith: query, mode: 'insensitive' } },
                { firstName: { startsWith: query, mode: 'insensitive' } },
                { lastName: { startsWith: query, mode: 'insensitive' } },
            ]
        },
        select:{
            id: true,
            username: true,
            thumbnail: true,
            firstName: true,
            lastName: true   
        }
    });

    console.log("users: ", users)

    return users;
}
