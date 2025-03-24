import { Message } from "@prisma/client";
import { getConnection } from "./services";
import { CloudflareBindings } from "./cloudflare";

export const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB


// Function to broadcast the message
export async function broadcastMessage(
    env: CloudflareBindings,
    senderSockets: WebSocket[],
    receiverSockets: WebSocket[],
    message: Message,
    senderId: number,
    participants: {
        receiverId: number;
        senderId: number;
    } | null

) {
    // Get sender and receiver Ids
    let receiverFriendId
    let senderFriendId
    if (senderId === participants?.senderId) {
        senderFriendId = senderId
        receiverFriendId = participants?.receiverId
    }
    if (senderId === participants?.receiverId) {
        senderFriendId = participants?.receiverId
        receiverFriendId = senderId
    }

    // Get friend
    const senderFriend = await getConnection(env, message.connectionId, receiverFriendId as number)
    const recieverFriend = await getConnection(env, message.connectionId, senderFriendId as number)

    // Loop into all sender sockets (if he's connected from more than 1 device)
    for (const senderSocket of senderSockets) {
        senderSocket.send(JSON.stringify({
            source: 'message',
            data: {
                message: {
                    content: message.content,
                    connectionId: message.connectionId,
                    createdAt: message.createdAt,
                    isSeen: message.isSeen,
                    type: message.type,
                    mimeType: message.mimeType,
                    fileName: message.fileName,
                    id: message.id,
                    accountId: message.accountId
                },
                friend: senderFriend
            }
        }))
    }

    if (receiverSockets.length === 0) {
        // TODO: if the receiver isn't connected so a notification will be send to him
    }

    // Loop into all receiver sockets (if he's connected from more than 1 device)
    for (const receiverSocket of receiverSockets) {
        receiverSocket.send(JSON.stringify({
            source: 'message',
            data: {
                message: {
                    content: message.content,
                    connectionId: message.connectionId,
                    createdAt: message.createdAt,
                    isSeen: message.isSeen,
                    type: message.type,
                    mimeType: message.mimeType,
                    fileName: message.fileName,
                    id: message.id,
                    accountId: message.accountId
                },
                friend: recieverFriend
            }
        }))
        console.log('receiver tags')

    }

}