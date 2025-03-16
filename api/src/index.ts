import { DurableObject } from "cloudflare:workers";
import { Hono } from 'hono';

export class MyDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}
	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(new URL(request.url).pathname);
// 		let stub = env.MY_DURABLE_OBJECT.get(id);
// 		let greeting = await stub.sayHello("world");
// 		return new Response(greeting);
// 	},
// } satisfies ExportedHandler<Env>;

const app = new Hono<{ Bindings: Env}>();

 
app.get('/', c => {
	return c.json({ message: 'Hello World' });
   });
   
   export default app;