import { Buffer } from 'node:buffer';
import { fileTypeFromBuffer } from 'file-type';
import { Context } from 'hono';
import { CloudflareBindings } from './cloudflare';
import { ErrorCodes } from './errors';

// Detect file format
export async function fileDetectFormat(base64: string) {
    try {
        let body = Buffer.from(base64, 'base64');
        console.log("Converted body: ", body);

        console.log(`Converted base64 of ${base64.length} to raw ${body.byteLength} bytes`);

        console.log('Detecting image type');
        const type = await fileTypeFromBuffer(body);
        console.log(`Detected file type: ${type?.mime ?? 'unknown'} (ext: ${type?.ext ?? 'unknown'})`);
        return type;
    } catch (e) {
        console.error('Error while converting base64 string to Buffer', e);
        throw e;
    }
}

// Taken from https://developers.cloudflare.com/r2/api/workers/demo-worker/
export function parseRange(encoded: string | null): undefined | { offset: number, end: number, length: number; } {
    if (encoded === null) {
      return;
    }
  
    const parts = encoded.split('bytes=')[1]?.split('-') ?? [];
    if (parts.length !== 2) {
      throw new Error('Not supported to skip specifying the beginning/ending byte at this time');
    }
  
    return {
      offset: Number(parts[0]),
      end: Number(parts[1]),
      length: Number(parts[1]) + 1 - Number(parts[0]),
    };
  }

// Download file from R2 Bucket 
export async function r2FileDownload(c: Context<{
    Bindings: CloudflareBindings;
  }>, key: string, mimeType: string, bucket: R2Bucket, immutable = true): Promise<Response> {
    // Get the document body from R2, with range support
    const range = parseRange(c.req.raw.headers.get('range') ?? null);
    const obj = await bucket.get(key, {
      range,
      onlyIf: c.req.raw.headers,
    });
    if (!obj) {
      console.error(`R2 file not found for ${key}`);
      return c.json({ error: 'Sorry, file is no longer available', code: ErrorCodes.NotFound }, 404);
    }
  
    // Prepare return headers
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('content-type', mimeType);
    if (range) {
      headers.set('content-range', `bytes ${range.offset}-${range.end}/${obj.size}`);
    }
  
    if (immutable) {
      // Resource will never change, so we can cache it for a long time
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      headers.set('expires', new Date(Date.now() + 31536000000).toUTCString());
    }
  
    // Detect if there are something in the body
    const objBody = obj as R2ObjectBody;
    if (objBody.body) {
      return new Response(objBody.body, {
        headers,
        status: range ? 206 : 200,
      });
    } else {
      return new Response(undefined, {
        headers,
        status: 304,
      });
    }
  }