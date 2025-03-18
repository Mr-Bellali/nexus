import { JWTPayload, jwtVerify } from 'jose';

export async function verifyJWT(jwt: string, secret: string): Promise<JWTPayload> {
  const jsecret = new TextEncoder().encode(secret);
  const result = await jwtVerify(jwt, jsecret);
  return result.payload;
}
