import { Logger } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import { promises } from 'fs';
import { AppModule } from './app.module';
import { SocketMeta } from './types';

declare module 'socket.io' {
  interface Socket {
    meta: SocketMeta;
  }
}

process.on('uncaughtException', (e) => {
  Logger.error(e, 'GenericErrorLogger');
});

async function bootstrap() {
  let httpsOptions: HttpsOptions | null = null;
  const port = 4000;
  // if (process.env.NODE_ENV === 'production') {
  //   httpsOptions = {
  //     cert: await promises.readFile('<path to cert>'),
  //     key: await promises.readFile('<path to key>'),
  //   };
  // }

  const app = await NestFactory.create(AppModule, {
    cors: true,
    // httpsOptions,
  });
  app.use(
    json({
      limit: '20mb',
    }),
    urlencoded({
      extended: true,
      limit: '20mb',
    }),
    // helmet(),
  );

  await app.listen(port);
  Logger.log(`Listening on port ${port}`, 'Server');
}

bootstrap();
