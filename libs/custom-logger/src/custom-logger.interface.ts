import { ModuleMetadata, Type } from '@nestjs/common';

export interface CustomLoggerModuleOptions {
  http: {
    enable: boolean;
    host: string;
    url: string;
    ssl: boolean;
  };
  console: {
    enable: boolean;
    color: string;
  };
  levels: {
    [key: string]: number;
  };
  loggerLevel: string;
  additionalFields?: Record<string, () => string>;
}

export interface CustomLoggerModuleFactory {
  createCustomLoggerModuleOptions: () =>
    | Promise<CustomLoggerModuleOptions>
    | CustomLoggerModuleOptions;
}

export interface CustomLoggerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<CustomLoggerModuleFactory>;
  useExisting?: Type<CustomLoggerModuleFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<CustomLoggerModuleOptions> | CustomLoggerModuleOptions;
}
