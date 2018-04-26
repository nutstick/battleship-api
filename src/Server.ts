import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import { GlobalAcceptMimesMiddleware, ServerLoader, ServerSettings } from 'ts-express-decorators';
import { $log } from 'ts-log-debug';
import { MongoDBService } from './services/MongoDB.service';

const rootDir = path.resolve(__dirname);

@ServerSettings({
  rootDir,
  mount: {
      '/api': `${rootDir}/controllers/**/**.controller.{ts,js}`,
  },
  componentsScan: [
      '${rootDir}/middlewares/**/**.{ts,js}',
      '${rootDir}/services/**/**.service.{ts,js}',
  ],
  acceptMimes: ['application/json'],
  passport: {},
//   debug: true,
  port: process.env.PORT || 3000,
})
export class Server extends ServerLoader {
    $onMountingMiddlewares(): void | Promise<any> {

        this
            .use(GlobalAcceptMimesMiddleware)
            .use(cookieParser())
            .use(compression())
            // .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: false,
            }));

        return null;
    }

    async $onInit(): Promise<any> {
        await MongoDBService.connect();
        $log.debug('MongoDB connected');
    }

    public $onReady() {
        $log.info('Server initialized');
    }

    public $onServerInitError(error): any {
        $log.error('Server encounter an error =>', error);
    }
}
