const { createServer } = require('node:http');

const { createApp } = require('./src/app');
const { env } = require('./src/config/env');
const { connectToDatabase } = require('./src/config/db');

async function main() {
  await connectToDatabase(env.MONGODB_URI);

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

