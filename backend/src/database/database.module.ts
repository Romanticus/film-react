import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from 'src/films/entities/film.entity';
import { Schedule } from 'src/films/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get<'postgres' | 'mysql' | 'sqlite'>('DATABASE_DRIVER', 'postgres');
        return{
        type: driver, 
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USERNAME'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [Film,Schedule],
        synchronize: false,
        // logging: true, 
        // logger: 'advanced-console',
      }},
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
