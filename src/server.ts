import { Server } from 'http';
import app from './app';
import config from './config';
import db from './app/db/connection';

let server: Server;

async function main(): Promise<void> {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');

    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📡 API base URL: http://localhost:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }

  const exitHandler = (): void => {
    if (server) {
      server.close(async () => {
        console.log('Server closed');
        await db.destroy();
        process.exit(0);
      });
    } else {
      process.exit(1);
    }
  };

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    exitHandler();
  });

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    exitHandler();
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    exitHandler();
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    exitHandler();
  });
}

main();
