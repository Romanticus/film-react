import { Module } from '@nestjs/common';
import {ServeStaticModule} from "@nestjs/serve-static";
import {ConfigModule} from "@nestjs/config";
import * as path from "node:path";

import {configProvider} from "./app.config.provider";
import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmsRepository } from './repository/films.repository';
import { FilmsModule } from './films/films.module';

@Module({
  exports: [configProvider],
  imports: [
	ConfigModule.forRoot({
          isGlobal: true,
          cache: true
      }),
      ServeStaticModule.forRoot({
        rootPath: path.join(__dirname, '..', 'public'),
        serveRoot: '',
      }),
      FilmsModule
      // @todo: Добавьте раздачу статических файлов из public
  ],
  controllers: [ OrderController],
  providers: [configProvider, OrderService],
})
export class AppModule {}
