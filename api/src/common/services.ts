import { Context } from 'hono';
import { CloudflareBindings } from './cloudflare';
import { getPrismaClient } from './prisma';


export async function searchUsers(env: CloudflareBindings, query: string, id: number) {
    const prisma = getPrismaClient(env);

    const users = await prisma.account.findMany({
        where: {
            NOT: { id },
            OR: [
                { username: { startsWith: query, mode: 'insensitive' } },
                { firstName: { startsWith: query, mode: 'insensitive' } },
                { lastName: { startsWith: query, mode: 'insensitive' } },
            ]
        },
        select: {
            id: true,
            username: true,
            thumbnail: true,
            firstName: true,
            lastName: true,
            sentConnections: {
                where: { receiverId: id },
                select: { accepted: true }
            },
            receivedConnections: {
                where: { senderId: id },
                select: { accepted: true }
            }
        }
    });

    // Format the users to return their status according to the searcher
    const enhancedUsers = users.map(user => {
        const sentConnection = user.sentConnections[0]; // If the user sent a request
        const receivedConnection = user.receivedConnections[0]; // If the user received a request

        let status: string = "no-connection";
        if (sentConnection?.accepted) {
            status = "connected";
        } else if (receivedConnection?.accepted) {
            status = "connected";
        } else if (sentConnection) {
            status = "pending-me"; // I sent the request, but it's pending
        } else if (receivedConnection) {
            status = "pending-them"; // They sent the request, but it's pending
        }

        return {
            id: user.id,
            username: user.username,
            thumbnail: user.thumbnail,
            firstName: user.firstName,
            lastName: user.lastName,
            status: status
        }
    })

    console.log("users with status: ", enhancedUsers);
    return enhancedUsers;

}

export async function getUser(env: CloudflareBindings, id: number) {
    const prisma = getPrismaClient(env);
    const user = await prisma.account.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            username: true,
            thumbnail: true,
            firstName: true,
            lastName: true,
            sentConnections: {
                where: { receiverId: id },
                select: { accepted: true }
            },
            receivedConnections: {
                where: { senderId: id },
                select: { accepted: true }
            }
        }
    })
    return user
}

export async function createConnection(env: CloudflareBindings, senderId: number, receiverId: number) {
    const prisma = getPrismaClient(env);
    const connection = await prisma.connection.create({
        data: {
            senderId,
            receiverId,
        },
        select: {
            id: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            createdAt: true
        }
    })
    return connection
}

export async function getRecieverConnections(env: CloudflareBindings, receiverId: number) {
    const prisma = getPrismaClient(env);
    const connections = await prisma.connection.findMany({
        where:{
            receiverId,
            accepted: false
        },
        select: {
            id: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            createdAt: true
        }
    })
    return connections
}

export async function acceptConnection(env: CloudflareBindings, id: string) {
    const prisma = getPrismaClient(env)
    const connection = await prisma.connection.update({
        where: {
            id
        },
        data: {
            accepted: true
        },
        select: {
            id: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    thumbnail: true
                }
            },
            createdAt: true
        }
    })
    return connection
}