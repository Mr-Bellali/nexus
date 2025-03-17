import { DurableObject } from "cloudflare:workers";

export class Chat extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }
    async sayHello(name: string): Promise<string> {
        return `Hello, ${name}!`;
    }
}