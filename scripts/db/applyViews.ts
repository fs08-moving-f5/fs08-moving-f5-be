import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

const VIEWS_DIR = path.resolve(process.cwd(), 'prisma', 'views');

const getSqlFiles = async () => {
  const fileNames = await fs.readdir(VIEWS_DIR);
  return fileNames
    .filter((name) => name.toLowerCase().endsWith('.sql'))
    .sort()
    .map((name) => path.join(VIEWS_DIR, name));
};

const applyViews = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const sqlFiles = await getSqlFiles();
    if (sqlFiles.length === 0) {
      console.log('No SQL files found in views directory');
      return;
    }

    for (const filePath of sqlFiles) {
      const sql = await fs.readFile(filePath, 'utf8');
      await client.query(sql);
      console.log(`Applied view from ${filePath}`);
    }

    console.log('All views applied successfully');
  } finally {
    await client.end();
  }
};

applyViews().catch((error) => {
  console.error('Error applying views:', error);
  process.exit(1);
});
