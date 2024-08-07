import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  CustomLoggerServiceToken,
  CustomLoggerModuleOptionsToken,
} from './custom-logger.constants';
import {
  CustomLoggerModuleOptions,
  CustomLoggerModuleAsyncOptions,
  CustomLoggerModuleFactory,
} from './custom-logger.interface';
import { createCustomLoggerProvider } from './custom-logger.provider';
import { getCustomLoggerModuleOptions } from './utils';

@Global()
@Module({})
export class CustomLoggerModule {
  public static forRoot(options: CustomLoggerModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: CustomLoggerModuleOptionsToken,
      useValue: getCustomLoggerModuleOptions(options),
    };
    const customLoggerProvider: Provider = createCustomLoggerProvider();
    return {
      module: CustomLoggerModule,
      providers: [optionsProvider, customLoggerProvider],
      exports: [customLoggerProvider],
    };
  }

  public static forRootAsync(
    options: CustomLoggerModuleAsyncOptions,
  ): DynamicModule {
    const provider: Provider = {
      inject: [CustomLoggerModuleOptionsToken],
      provide: CustomLoggerServiceToken,
      useFactory: async (options: CustomLoggerModuleOptions) =>
        getCustomLoggerModuleOptions(options),
    };
    const customLoggerProvider: Provider = createCustomLoggerProvider();
    const providers = [
      ...this.createAsyncProviders(options),
      customLoggerProvider,
    ];

    const module = {
      module: CustomLoggerModule,
      imports: options.imports,
      providers,
      exports: [provider],
    };

    return module;
  }

  private static createAsyncProviders(
    options: CustomLoggerModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<CustomLoggerModuleFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: CustomLoggerModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CustomLoggerModuleOptionsToken,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<CustomLoggerModuleFactory>,
    ];

    return {
      provide: CustomLoggerModuleOptionsToken,
      useFactory: async (optionsFactory: CustomLoggerModuleFactory) =>
        await optionsFactory.createCustomLoggerModuleOptions(),
      inject,
    };
  }
}
