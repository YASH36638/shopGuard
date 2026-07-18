import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Make sure yaha DIRECT_URL hai, DATABASE_URL nahi!
    url: process.env.DIRECT_URL!, 
  },
});