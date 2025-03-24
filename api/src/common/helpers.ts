import { Message } from "@prisma/client";

export const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB

// Function to broadcast the message
export async function broadcastMessage(
    senderSockets: WebSocket[],
    receiverSockets: WebSocket[],
    message: Message,
) {
    // Loop into all sender sockets (if he's connected from more than 1 device)
    for (const senderSocket of senderSockets) {
        senderSocket.send(JSON.stringify({
            id: message.id,
            accountId: message.accountId,
            source: 'message',
            content: message.content,
            connectionId: message.connectionId,
            createdAt: message.createdAt,
            isSeen: message.isSeen,
            type: message.type,
            mimeType: message.mimeType,
            fileName: message.fileName
        }))
    }

    if (receiverSockets.length === 0) {
        // TODO: if the receiver isn't connected so a notification will be send to him
    }

    // Loop into all receiver sockets (if he's connected from more than 1 device)
    for (const receiverSocket of receiverSockets) {
        receiverSocket.send(JSON.stringify({
            id: message.id,
            accountId: message.accountId,
            source: 'message',
            content: message.content,
            connectionId: message.connectionId,
            createdAt: message.createdAt,
            isSeen: message.isSeen,
            type: message.type,
            mimeType: message.mimeType,
            fileName: message.fileName
        }))
    }
}