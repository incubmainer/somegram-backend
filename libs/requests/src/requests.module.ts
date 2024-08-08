import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  RequestsServiceToken,
  RequestsModuleOptionsToken,
} from './requests.constants';
import {
  RequestsModuleOptions,
  RequestsModuleAsyncOptions,
  RequestsModuleFactory,
} from './requests.interface';
import { createRequestsProvider } from './requests.provider';
import { getRequestsModuleOptions } from './utils';

@Global()
@Module({})
export class RequestsModule {
  public static forRoot(options: RequestsModuleOptions): DynamicModule {
    const provider: Provider = createRequestsProvider(options);
    return {
      module: RequestsModule,
      providers: [provider],
      exports: [provider],
    };
  }

  public static forRootAsync(
    options: RequestsModuleAsyncOptions,
  ): DynamicModule {
    const provider: Provider = {
      inject: [RequestsModuleOptionsToken],
      provide: RequestsServiceToken,
      useFactory: async (options: RequestsModuleOptions) =>
        getRequestsModuleOptions(options),
    };

    return {
      module: RequestsModule,
      imports: options.imports,
      providers: [...this.createAsyncProviders(options), provider],
      exports: [provider],
    };
  }

  private static createAsyncProviders(
    options: RequestsModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<RequestsModuleFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: RequestsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: RequestsModuleOptionsToken,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<RequestsModuleFactory>,
    ];

    return {
      provide: RequestsModuleOptionsToken,
      useFactory: async (optionsFactory: RequestsModuleFactory) =>
        await optionsFactory.createRequestsModuleOptions(),
      inject,
    };
  }
}
