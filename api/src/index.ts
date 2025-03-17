import { OpenAPIHono } from "@hono/zod-openapi";
import { CloudflareBindings } from './common/cloudflare';
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { setupAuthApi } from './accounts';
import { Chat } from './chat';
export { Chat }

const app = new OpenAPIHono();
const api = new OpenAPIHono<{ Bindings: CloudflareBindings }>();
api.use('*', logger())
api.use('*', cors())

setupAuthApi(api)

app.route('/api', api);

export default app;