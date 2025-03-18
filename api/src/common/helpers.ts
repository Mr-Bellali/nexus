import { Context } from "hono";
import { ErrorCodes } from "./errors";
import { fileDetectFormat } from "./utils";
import { CloudflareBindings } from "./cloudflare";
import { getPrismaClient } from './prisma';



export const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB

// Function to handle media upload
export async function handleMediaUpload(
    c: Context<{ Bindings: CloudflareBindings }>,
    documentB64: string,
    fileName: string,
    employeeId: number,
    role: "EMPLOYEE" | "STAFF",
    isBowi: boolean, // Determines if conversation creation is for bowi (true) or mobile (false)
    extraParams?: { staffId?: number }
  ): 
  Promise<any> 
  
  {
    // Validate file size
    const decoded = Buffer.from(documentB64, 'base64');
    if (decoded.length > MAX_MEDIA_SIZE) {
      console.error(`The file size of the proof document is too large: ${decoded.length}`);
      return c.json({
        error: 'Document is too large, 10MB max',
        code: ErrorCodes.InvalidDocument,
      }, 400);
    }
  
    // Detect the file type
    const type = await fileDetectFormat(documentB64)

    if (!type) {
      console.error(`Could not detect the file type of the file sent, no type returned`);
      return c.json({
        error: 'Could not detect the file type of the file',
        code: ErrorCodes.InvalidDocument,
      }, 400);
    }

    // Destructing ext & mime from type
    const { ext, mime } = type

    if (!['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type.mime)) {
      console.error(`Invalid file type of the file: ${type.mime}`);
      return c.json({
        error: 'Invalid file type of the file',
        code: ErrorCodes.InvalidDocument,
      }, 400);
    }
  
    // Generate a unique file name and upload the file to R2
    const uniqueFileName = `${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}.${type.ext}`;
    await c.env.CHAT_MEDIA.put(uniqueFileName, decoded);
  
    // Get the Prisma client and find the conversation
    const prisma = getPrismaClient(c);
    // const conversation = await prisma.conversation.findFirst({
    //   where: { employeeId }
    // });
    // let newConversation;
    // if (!conversation) {
    //   newConversation = await createConversation(c.env, employeeId, isBowi);
    // }
  
    // Create a new message. For STAFF, pass extraParams.staffId if available.
    // let newMessage;
    // if (role === "EMPLOYEE") {
    //   newMessage = await createMessage(
    //     c.env,
    //     employeeId,
    //     employeeId,
    //     role,
    //     "",
    //     MessageType.MEDIA,
    //     uniqueFileName,
    //     type.mime,
    //     fileName
    //   );
    // } else {
    //   newMessage = await createMessage(
    //     c.env,
    //     employeeId,
    //     employeeId,
    //     role,
    //     "",
    //     MessageType.MEDIA,
    //     uniqueFileName,
    //     type.mime,
    //     fileName,
    //     extraParams?.staffId
    //   );
    // }
    // if (!newMessage) {
    //   return c.json({
    //     error: 'Failed to create the message',
    //     code: ErrorCodes.InternalServerError,
    //   }, 500);
    // }
  
    // return c.json({
    //   newConversation,
    //   mediaId: newMessage.id
    // });
  }