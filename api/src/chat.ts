import { OpenAPIHono, z } from "@hono/zod-openapi";
import { CloudflareBindings } from "./common/cloudflare";
import { HTTPException } from "hono/http-exception";
import { Context } from "hono";
import { verifyJWT } from "./common/jwt";
import { fileDetectFormat } from "./common/utils";
import { MAX_MEDIA_SIZE } from "./common/helpers";
import { getPrismaClient } from "./common/prisma";
import { acceptConnection, createConnection, getConnections, getFriends, searchUsers } from "./common/services";

export enum DataType {
    THUMBNAIL = "thumbnail",
    SEARCH = "search",
    REQUESTCONNECT = 'request-connect',
    REQUESTLIST = 'request-list',
    REQUESTACCEPT = 'request-accept',
    FRIENDS = 'friends'
}

const webSocketDataSchema = z.object({
    source: z.nativeEnum(DataType),
    base64: z.string().optional(),
    filename: z.string().optional(),
    type: z.string().optional(),
    content: z.string().optional(),
    id: z.any().optional()
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
            console.log("payload: ", payload)
        } catch (error: any) {
            console.error("jwt verification error: ", error.message);
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
        console.log("incoming: ", parsedData)
        const validateSocketData = webSocketDataSchema.safeParse(parsedData);
        if (!validateSocketData.success) {
            return JSON.stringify({
                error: validateSocketData.error.errors,
            })
        }

        const { source, base64, type, content, id } = validateSocketData.data;

        console.log("source: ", source)

        switch (source) {
            case 'thumbnail':
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

            case 'search':
                console.log("inside search!!")
                // console.log("users: ", await searchUsers(this.env, content as string, senderAccountId))
                const users = await searchUsers(this.env, content as string, senderAccountId);
                console.log("users-- ", users)
                ws.send(JSON.stringify({
                    source: "search",
                    data: users
                }))
                break

            case 'request-connect':
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

            case 'request-list':
                const connections = await getConnections(this.env, senderAccountId);
                console.log("connections: ", connections)
                senderSocket[0].send(JSON.stringify({
                    source: "request-list",
                    data: connections
                }))
                break;

            case 'request-accept':
                const acceptedConnection = await acceptConnection(this.env, id)       
                console.log("accepted connection: ", acceptedConnection)         
                senderSocket[0].send(JSON.stringify({
                    source: "request-accept",
                    data: acceptedConnection
                }))
                console.log("accepter connection sent seccussfully 1!")
                recieverSockets = this.state.getWebSockets(`${acceptedConnection.sender.id}`);
                for (const socket of recieverSockets) {
                    socket.send(JSON.stringify({
                        source: "request-accept",
                        data: acceptedConnection
                    }))
                }
                console.log("accepter connection sent seccussfully 2!")
                break;
            
            case 'friends': 
                const friends = await getFriends(this.env, senderAccountId);
                console.log("friends: ",friends)
                ws.send(JSON.stringify({
                    source: 'friends',
                    data: friends
                }))
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