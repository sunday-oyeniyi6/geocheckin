import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Le fichier .env unique est à la racine du dépôt.
config({ path: path.resolve(__dirname, '..', '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
