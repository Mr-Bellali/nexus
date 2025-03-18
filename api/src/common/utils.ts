import { FileTypeResult } from './../../node_modules/file-type/core.d';
import { Buffer } from 'node:buffer';
import { fileTypeFromBuffer } from 'file-type';

function base64ToArrayBuffer(base64: string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Detect file format
export async function fileDetectFormat(base64: string) {
    let body = base64ToArrayBuffer(base64)
    let convertedBody
    try {
        convertedBody = Buffer.from(atob(Buffer.from(body).toString('utf-8')), 'binary')
    } catch (e) {
        console.error('Error while converting base64 string to Buffer', e);
        throw e;
    }
    console.log(`Converted base64 of ${length} to raw ${body.byteLength} bytes`);

    // Detect the file type from its content
    console.log('Detecting image type')
    const type = await fileTypeFromBuffer(body);
    console.log(`Detected file type: ${type?.mime ?? 'unknown'} (ext: ${type?.ext ?? 'unknown'})`);
    return type
}
