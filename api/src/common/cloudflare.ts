

export type CloudflareBindings = {
    ENV: string;
    JWT_SECRET_KEY: string;

    // Prisma
    PROXY_URL: string;
    DATABASE_URL: string;

    // Chat
    CHAT: DurableObjectNamespace;
    CHAT_MEDIA: R2Bucket;
}