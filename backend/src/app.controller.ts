import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
  Req,
  RequestTimeoutException,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import { join } from 'path';
import { Socket } from 'socket.io';
import { AppGateway } from './app.gateway';
import { APP_REQUEST_TIMEOUT_IN_MS, PLATFORM_ERROR_RESPONSE_MAP } from './constants';
import { SocketEvent } from './events';
import { SocketType } from './types';

@Controller()
export class AppController {
  constructor(readonly gateway: AppGateway) {}

  @Get('status')
  getStatus() {
    return { running: true };
  }

  @HttpCode(200)
  @Post(':id([^.]+)/:path?')
  async handlePost(
    @Param('id') id: string,
    @Body() body: Request['body'],
    @Query() query: Request['query'],
    @Headers() headers: Request['headers'],
    @Param('path') path?: string,
  ) {
    if (path) {
      headers['webhook_path'] = `/${path}`;
    }

    const platform = this.getPlatformRequestType(body);
    const appSocket = this.gateway.socketRegistry.get({ id, type: SocketType.App }) as
      | Socket
      | undefined;
    if (!appSocket) {
      return PLATFORM_ERROR_RESPONSE_MAP[platform];
    }

    if (platform === 'None') {
      Logger.error(
        `No matching platform:\n${JSON.stringify(
          {
            id,
            userAgent: headers['user-agent'],
            query,
            body,
          },
          undefined,
          2,
        )}`,
      );
    }

    return this.postToApp(appSocket, {
      headers,
      params: query,
      data: body,
    });
  }

  @Get('/health')
  healthCheck() {
    return { ok: true };
  }

  @Get(':id([^.]+)')
  async handleGet(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    if (req.header('user-agent').startsWith('facebookplatform/')) {
      const appSocket = this.gateway.socketRegistry.get({ id, type: SocketType.App }) as
        | Socket
        | undefined;
      if (!appSocket) {
        return res.json(PLATFORM_ERROR_RESPONSE_MAP.None);
      }

      const challengeResult = await this.postToApp(appSocket, {
        data: {},
        headers: req.headers,
        params: req.query,
      });
      res.status(200).send(challengeResult + '');
    } else {
      res.sendFile(join(__dirname, '../public', 'index.html'));
    }
  }

  // TODO: can be optimized in the future
  private getPlatformRequestType(request: any): string {
    if (request.result || request.queryResult) {
      return 'GoogleAction';
    } else if (request.type && request.type === 'jovo-platform-web') {
      return 'WebPlatform';
    } else if (request.request && request.version && request.context && request.context.platform) {
      return 'CorePlatform';
    } else if (request.request && request.version) {
      return 'Alexa';
    } else if (request.DialogueSid && request.AssistantSid && request.UserIdentifier) {
      return 'Autopilot';
    } else if (request.dialogId && request.timestamp) {
      return 'Lindenbaum';
    } else if (request.object && request.entry) {
      return 'FacebookMessenger';
    } else if (request.$vivContext) {
      return 'Bixby';
    } else if (request.handler && request.scene && request.intent && request.user) {
      return 'GoogleActionConversationalAction';
    } else if (request.agent && request.conversationId && request.sendTime) {
      return 'GoogleBusinessMessages';
    } else {
      return 'None';
    }
  }

  private postToApp(
    socket: Socket,
    request: { data: any; headers: IncomingHttpHeaders; params: Record<string, any> },
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      socket.emit(SocketEvent.ServerRequest, request);
      const timeoutId = setTimeout(() => {
        return reject(new RequestTimeoutException('Request to app timed out.'));
      }, APP_REQUEST_TIMEOUT_IN_MS);
      socket.once(SocketEvent.AppResponse, (payload) => {
        clearTimeout(timeoutId);
        return resolve(payload.data);
      });
    });
  }
}
