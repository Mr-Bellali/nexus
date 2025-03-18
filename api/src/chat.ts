import { OpenAPIHono, z } from "@hono/zod-openapi";
import { CloudflareBindings } from "./common/cloudflare";
import { HTTPException } from "hono/http-exception";
import { Context } from "hono";
import { verifyJWT } from "./common/jwt";
import { fileDetectFormat } from "./common/utils";
import { ErrorCodes } from "./common/errors";
import { MAX_MEDIA_SIZE } from "./common/helpers";
import { getPrismaClient } from "./common/prisma";

export enum DataType {
    UPLOADTHUMBNAIL = "uploadthumbnail",
}

const webSocketDataSchema = z.object({
    source: z.nativeEnum(DataType),
    base64: z.string().optional(),
    filename: z.string().optional()
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

        // Validate the recieved websocket data
        const parsedData = JSON.parse(data);
        const validateSocketData = webSocketDataSchema.safeParse(parsedData);
        if (!validateSocketData.success) {
            return JSON.stringify({
                error: validateSocketData.error.errors,
            })
        }
        const { source, base64, filename } = validateSocketData.data;

        switch (source) {
            case 'uploadthumbnail':
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
                await this.env.CHAT_MEDIA.put(uniqueFileName, decoded)

                // initialize prisma
                const ctx = { env: this.env } as unknown as Context<{ Bindings: CloudflareBindings }>;
                const prisma = getPrismaClient(ctx)

                // update the thumbnail 
              try {
                const account = await prisma.account.update({
                    where: {
                        id: senderAccountId
                    },
                    data :{
                        thumbNail: uniqueFileName,
                        mimeType: type.mime,
                        fileName: filename
                    }
                })
                
                console.log("updated thumbnail: ", account)
              } catch (error) {
                console.error("error: ", error)
                return ws.send(JSON.stringify({
                    error: error
                }))
              }

                ws.send(JSON.stringify({
                    thumbnail: base64,
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
        console.log("CHAT binding:", c.env.CHAT);
        const durableObjectId = c.env.CHAT.idFromName("chat_id");
        const ChatDO = c.env.CHAT.get(durableObjectId);
        const result = await ChatDO.fetch(c.req.raw);
        if (result.status != 101) {
            return c.json({ error: "Failed to connect to websocket." }, 500);
        }
        return new Response(null, { status: 101, webSocket: result.webSocket });
    })
}