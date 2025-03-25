import { OpenAPIHono, z } from "@hono/zod-openapi";
import { CloudflareBindings } from "./common/cloudflare";
import { HTTPException } from "hono/http-exception";
import { Context } from "hono";
import { verifyJWT } from "./common/jwt";
import { fileDetectFormat } from "./common/utils";
import { broadcastMessage, MAX_MEDIA_SIZE } from "./common/helpers";
import { getPrismaClient } from "./common/prisma";
import { acceptConnection, createConnection, createMessage, getConnection, getConnectionParticipants, getConnections, getFriends, loadMessages, searchUsers } from "./common/services";

export enum DataType {
    THUMBNAIL = "thumbnail",
    SEARCH = "search",
    REQUESTCONNECT = 'request-connect',
    REQUESTLIST = 'request-list',
    REQUESTACCEPT = 'request-accept',
    FRIENDS = 'friends',
    MESSAGE = 'message',
    MESSAGESLIST = 'messageslist',
    TYPINGMESSAGE = 'typing-message'
}

const webSocketDataSchema = z.object({
    source: z.nativeEnum(DataType),
    base64: z.string().optional(),
    filename: z.string().optional(),
    type: z.string().optional(),
    content: z.string().optional(),
    id: z.any().optional(),
    page: z.number().optional()
})

export class Chat {
    private state: DurableObjectState;
    private env: CloudflareBindings;
    constructor(state: DurableObjectState, env: CloudflareBindings) {
        this.state = state;
        this.env = env;
        this.state.setWebSocketAutoResponse(
            new WebSocketRequestResponsePair("ping", "pong")
        );
    }

    // Helpers functions
    private async saveAndBroadcastTextMessage(
        ws: WebSocket,
        senderId: number,
        connectionId: string,
        content: string) {
        try {
            const message = await createMessage(
                this.env,
                senderId,
                connectionId,
                content,
                'text'
            )
            if (!message) {
                return ws.send(JSON.stringify({ error: "Failed to save the message, please try again" }));
            }

            const participants = await getConnectionParticipants(this.env, connectionId);
            console.log('participants: ', participants)
            console.log('sender Id: ', senderId)
            console.log('participent sender Id: ', participants?.senderId)
            console.log('participent receiver Id: ', participants?.receiverId)

            let receiverSockets
            let senderSockets
            if (senderId === participants?.senderId) {
                senderSockets = this.state.getWebSockets(`${participants?.senderId}`);
                receiverSockets = this.state.getWebSockets(`${participants.receiverId}`)
            }
            if (senderId === participants?.receiverId) {
                senderSockets = this.state.getWebSockets(`${participants?.receiverId}`);
                receiverSockets = this.state.getWebSockets(`${participants?.senderId}`)
            }
           
            for (const socket of senderSockets as WebSocket[]) {
                const tags = this.state.getTags(socket)
                console.log("sender tags: ", tags)
            }

            for (const socket of receiverSockets as WebSocket[]) {
                const tags = this.state.getTags(socket)
                console.log("receiver tags: ", tags)
            }

            // broadcast the message
            await broadcastMessage(
                this.env,
                senderSockets as WebSocket[],
                receiverSockets as WebSocket[],
                message,
                senderId,
                participants,
            )

        } catch (error) {
            console.error("Error occurred:", error);
            ws.close(1011, JSON.stringify({ code: 500, error: "Internal server error." }));
        }
    }

    // Function to get the account ID from the websocket
    getSenderAccountIdFromSocket(ws: WebSocket): number | null {
        const tags = this.state.getTags(ws);
        if (!tags) {
            console.error('Invalid tags');
            return null
        }
        return Number(tags[0])
    }

    async fetch(request: Request) {
        const url = new URL(request.url);

        // Validate the token and get the account ID from it
        const token = url.searchParams.get('token');
        if (!token) {
            return new Response(null, { status: 401, statusText: 'Invalid JWT token' });
        }

        // Verify jwt and get payload (accountID)
        let payload;
        try {
            payload = await verifyJWT(token, this.env.JWT_SECRET_KEY)
            // console.log("payload: ", payload)
        } catch (error: any) {
            // console.error("jwt verification error: ", error.message);
            return new Response(null, { status: 401, statusText: 'Invalid JWT token' });
        }

        const pair = new WebSocketPair();

        // Set tag for the socket to identify it later
        this.state.acceptWebSocket(pair[1], [`${payload.accountId}`])
        return new Response(null, { status: 101, webSocket: pair[0] });
    }

    async webSocketMessage(ws: WebSocket, data: string) {
        const senderAccountId = this.getSenderAccountIdFromSocket(ws);
        if (!senderAccountId || senderAccountId === null) {
            return ws.close(1011, "Please Refresh the page and try again");
        }

        const senderSocket = this.state.getWebSockets(`${senderAccountId}`)
        let recieverSockets;

        // Validate the recieved websocket data
        const parsedData = JSON.parse(data);
        // console.log("incoming: ", parsedData)
        const validateSocketData = webSocketDataSchema.safeParse(parsedData);
        if (!validateSocketData.success) {
            return JSON.stringify({
                error: validateSocketData.error.errors,
            })
        }

        const { source, base64, type, content, id, page } = validateSocketData.data;

        // console.log("source: ", source)

        switch (source) {
            case DataType.THUMBNAIL:
                switch (type) {
                    case 'upload':
                        if (!base64) {
                            return ws.send(JSON.stringify({
                                error: "Can't upload an empty file"
                            }))
                        }

                        // decode base64
                        const decoded = Buffer.from(base64, 'base64');

                        // Check the file size must not be above 10mB
                        if (decoded.length > MAX_MEDIA_SIZE) {
                            console.error(`The file size of the proof document is too large: ${decoded.length}`);
                            return ws.send(JSON.stringify({
                                error: "Document is too large, 10MB max"
                            }))
                        }

                        // Detect file type
                        const type = await fileDetectFormat(base64);
                        if (!type) {
                            return ws.send(JSON.stringify({
                                error: "Couldn't detect the file type"
                            }))
                        }

                        // Check if the file type supported
                        if (!['image/jpeg', 'image/png', 'image/gif'].includes(type.mime)) {
                            console.error(`Invalid file type of the file: ${type.mime}`);
                            return ws.send(JSON.stringify({
                                error: "Unsoppurted file format, please try another one"
                            }))
                        }

                        // Generate a unique file name and upload the file to R2
                        const uniqueFileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.${type.ext}`;
                        await this.env.chat_media.put(uniqueFileName, decoded)

                        // initialize prisma
                        const prisma = getPrismaClient(this.env)

                        // update the thumbnail 
                        let account
                        try {
                            account = await prisma.account.update({
                                where: {
                                    id: senderAccountId
                                },
                                data: {
                                    thumbnail: uniqueFileName,
                                    mimeType: type.mime,
                                }
                            })
                        } catch (error) {
                            console.error("error: ", error)
                            return ws.send(JSON.stringify({
                                error: error
                            }))
                        }

                        const neededAccount = {
                            id: account.id,
                            username: account.username,
                            firstName: account.firstName,
                            lastName: account.lastName,
                            thumbnail: account.thumbnail
                        }

                        ws.send(JSON.stringify({
                            source: 'thumbnail',
                            data: neededAccount,
                        }))
                        break;

                    default:
                        break;
                }

                break;

            case DataType.SEARCH:
                // console.log("inside search!!")
                // console.log("users: ", await searchUsers(this.env, content as string, senderAccountId))
                const users = await searchUsers(this.env, content as string, senderAccountId);
                // console.log("users-- ", users)
                ws.send(JSON.stringify({
                    source: "search",
                    data: users
                }))
                break

            case DataType.REQUESTCONNECT:
                // Get the requested user
                if (!id) {
                    return ws.send(JSON.stringify({
                        error: "cannot send a friend request with missing id"
                    }))
                }
                // const requestedUser = await getUser(this.env, id)
                // console.log("requested user = ", requestedUser)

                // Create new connection
                const connection = await createConnection(this.env, senderAccountId, id)

                // Broadcast to the sender.
                senderSocket[0].send(JSON.stringify({
                    source: "request-connect",
                    data: connection
                }))

                // Brodcast to the reciever
                recieverSockets = this.state.getWebSockets(`${id}`);
                for (const socket of recieverSockets) {
                    socket.send(JSON.stringify({
                        source: "request-connect",
                        data: connection
                    }))
                }

                break;

            case DataType.REQUESTLIST:
                const connections = await getConnections(this.env, senderAccountId);
                // console.log("connections: ", connections)
                senderSocket[0].send(JSON.stringify({
                    source: "request-list",
                    data: connections
                }))
                break;

            case DataType.REQUESTACCEPT:
                const acceptedConnection = await acceptConnection(this.env, id)
                // console.log("accepted connection: ", acceptedConnection)

                const participants = await getConnectionParticipants(this.env, acceptedConnection.id);
                let receiverFriendId
                let senderFriendId
                if (senderAccountId === participants?.senderId) {
                    senderFriendId = senderAccountId
                    receiverFriendId = participants?.receiverId
                }
                if (senderAccountId === participants?.receiverId) {
                    senderFriendId = participants?.receiverId
                    receiverFriendId = participants?.senderId
                }

                // Get friend
                const senderFriend = await getConnection(this.env, acceptedConnection.id, receiverFriendId as number)
                const recieverFriend = await getConnection(this.env, acceptedConnection.id, senderFriendId as number)

                senderSocket[0].send(JSON.stringify({
                    source: "request-accept",
                    data: acceptedConnection
                }))

                senderSocket[0].send(JSON.stringify({
                    source: 'new-friend',
                    data: recieverFriend
                }))

                recieverSockets = this.state.getWebSockets(`${acceptedConnection.sender.id}`);
                for (const socket of recieverSockets) {
                    socket.send(JSON.stringify({
                        source: "request-accept",
                        data: acceptedConnection
                    }))
                    socket.send(JSON.stringify({
                        source: 'new-friend',
                        data: senderFriend
                    }))
                }
                break;

            case DataType.FRIENDS:
                const friends = await getFriends(this.env, senderAccountId);
                // console.log("friends: ", friends)
                ws.send(JSON.stringify({
                    source: 'friends',
                    data: friends
                }))
                break;

            case DataType.MESSAGE:
                // Handle text messages
                if (type === 'text') {
                    // console.log('content: ', content);
                    // console.log('id: ', id)
                    if (!content) {
                        return ws.send(JSON.stringify({ error: "Can't send an empty message" }));
                    }

                    await this.saveAndBroadcastTextMessage(
                        ws,
                        senderAccountId,
                        id,
                        content
                    )

                    // Handle media type messages
                } else {

                }
                break;

            case DataType.MESSAGESLIST:
                let messages
                if (!page || page === 0) messages = await loadMessages(this.env, id, 1)
                else messages = await loadMessages(this.env, id, page)

                // console.log("messages: ", messages, "for the page: ", page)
                ws.send(JSON.stringify({
                    source: 'messageslist',
                    data: messages
                }))
                break;

            case DataType.TYPINGMESSAGE:
                // console.log(senderAccountId , " is typing ");
                // console.log("and ", id, " will be notified when ", senderAccountId, "is typing") 
                recieverSockets = this.state.getWebSockets(`${id}`);
                for(const socket of recieverSockets) {
                    socket.send(JSON.stringify({
                        source: 'typing-message',
                        data: {
                            senderId: senderAccountId
                        }
                    }))
                }
                break;
            default:
                break;
        }
    }
}

export function setupChatApi(api: OpenAPIHono<{ Bindings: CloudflareBindings }>) {
    api.get("/chat", async (c: Context) => {
        if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
            throw new HTTPException(402);
        }
        const durableObjectId = c.env.CHAT.idFromName("chat_id");
        const ChatDO = c.env.CHAT.get(durableObjectId);
        const result = await ChatDO.fetch(c.req.raw);
        if (result.status != 101) {
            return c.json({ error: "Failed to connect to websocket." }, 500);
        }
        return new Response(null, { status: 101, webSocket: result.webSocket });
    })
}