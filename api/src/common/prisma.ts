import { Prisma, PrismaClient } from '@prisma/client';
import { Context } from 'hono';
import { CloudflareBindings } from './cloudflare';
import { Pool } from '@prisma/pg-worker'
import { PrismaPg } from '@prisma/adapter-pg-worker'
import { withAccelerate } from '@prisma/extension-accelerate';


export function getPrismaClient( env: CloudflareBindings) {
    // Create base client
    let baseClient: PrismaClient;
    let prisma;
  
    // If DATABASE_URL is available, use direct connection with Pool and PrismaPg adapter
    if (env.DATABASE_URL) {
      const connectionString = env.DATABASE_URL;
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      baseClient = new PrismaClient({
        adapter,
        transactionOptions: {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,  // default: 2000
          timeout: 10000, // default: 5000
        },
      });
      prisma = baseClient.$extends(withAccelerate());
    } else {
      console.log("proxy_Url")
      // Fall back to PROXY_URL if DATABASE_URL is not available
      baseClient = new PrismaClient({
        datasources: {
          db: {
            url: env.PROXY_URL,
          },
        },
        transactionOptions: {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,  // default: 2000
          timeout: 10000, // default: 5000
        },
      });
    }

    prisma = baseClient.$extends(withAccelerate());
  
    return prisma;
  }