import { Context } from 'hono';
import { CloudflareBindings } from './cloudflare';
import { getPrismaClient } from './prisma';

const PAGE_SIZE = 15

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

    // console.log("users with status: ", enhancedUsers);
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

export async function getConnections(env: CloudflareBindings, receiverId: number) {
    const prisma = getPrismaClient(env);
    const connections = await prisma.connection.findMany({
        where: {
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

export async function getFriends(env: CloudflareBindings, id: number) {
    const prisma = getPrismaClient(env);
    const connections = await prisma.connection.findMany({
        where: {
            accepted: true,
            OR: [
                { senderId: id },
                { receiverId: id }
            ]
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
            createdAt: true,
            updatedAt: true,
            preview: true
        }
    })
    return connections.map(connection => ({
        id: connection.id,
        friend: connection.sender.id === id ? connection.receiver : connection.sender,
        preview: connection.preview ? connection.preview : 'Say hi 👋',  // Empty string as requested
        updatedAt: connection.updatedAt
    }));
}

export async function createMessage(
    env: CloudflareBindings,
    senderId: number,
    connectionId: string,
    content: string,
    messageType: "text" | "media",
    fileName?: string,
    mimeType?: string) {

    const prisma = getPrismaClient(env);
    let message = prisma.message.create({
        data: {
            content,
            type: messageType,
            connectionId,
            accountId: senderId,
            fileName,
            mimeType
        }
    })
    await prisma.connection.update({
        where: {
            id: connectionId
        },
        data: {
            preview: (await message).type == 'text' ? content : 'media received'
        }
    })
    return message
}

export async function getConnectionParticipants(env: CloudflareBindings, id: string) {
    const prisma = getPrismaClient(env);
    const connectionParticipants = await prisma.connection.findFirst({
        where: {
            id
        },
        select: {
            receiverId: true,
            senderId: true
        }
    })
    return connectionParticipants
}

export async function loadMessages(env: CloudflareBindings, id: string, page = 1) {
    const prisma = getPrismaClient(env);
    
    console.log(`Loading messages for page ${page}...`);
    
    const messagesData = await prisma.connection.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            messages: {
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * PAGE_SIZE,
                take: PAGE_SIZE,
            },
        }
    })

    const totalMessages = await prisma.message.count({
        where:{
            connectionId: messagesData?.id
        }
    })

    console.log(`Total messages: ${totalMessages}, Current page: ${page}`);
    
    const next = ( totalMessages > page * PAGE_SIZE ) ? page + 1 : null
    
    console.log(`Next page: ${next}`);
    
    return {
        messagesData,
        next
    }
}



export async function getConnection(env: CloudflareBindings, id: string, friendId: number) {
    const prisma = getPrismaClient(env);
    const connection = await prisma.connection.findFirst({
        where: {
            id,
            OR: [
                { senderId: friendId },
                { receiverId: friendId }
            ]
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
            createdAt: true,
            updatedAt: true,
            preview: true
        }
    });
    if (!connection) return null;

    return {
        id: connection.id,
        friend: connection.sender.id === friendId ? connection.receiver : connection.sender,
        preview: connection.preview ? connection.preview : 'Say hi 👋',
        updatedAt: connection.updatedAt
    };
}