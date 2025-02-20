import { ConfigModule } from '@nestjs/config';

const applicationConfig: AppConfigDatabase = { 
    driver: process.env.DATABASE_DRIVER,
    url:process.env.DATABASE_URL };

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useValue: <AppConfig>{
    database: applicationConfig,
  },
};

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
}
