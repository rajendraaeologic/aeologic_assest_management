import { Server } from 'http';
import app from '@/app';
import db from '@/lib/db';
import appConfig from '@/config/app';
import logger from '@/config/logger';
import * as functions from '@google-cloud/functions-framework';

let server: Server;
db.$connect().then(() => {
    logger.info('Connected to SQL Database');
    if(appConfig.env === "local"){
        server = app.listen(appConfig.port, () => {
            logger.info(`Listening to port ${appConfig.port}`);
        });
    }
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    if(server){
        server.close(async () => {
            try {
                await db.$disconnect();
                console.log('Closed out remaining connections.');
                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        });
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

functions.http('api', app);