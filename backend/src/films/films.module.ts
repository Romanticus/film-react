// films.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { FilmsRepository } from 'src/repository/films.repository';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return mongoose.connect(url);
      },
      inject: [ConfigService],
    },
    FilmsRepository,
    FilmsService,
  ],
  exports: ['DATABASE_CONNECTION', FilmsRepository],
  controllers: [FilmsController],
})
export class FilmsModule {}
