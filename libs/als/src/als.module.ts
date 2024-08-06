import { DynamicModule, Module } from '@nestjs/common';
import { AlsService } from './als.service';

class AlsModuleForRootConfig {
  isGlobal: boolean;
}

@Module({
  providers: [AlsService],
  exports: [AlsService],
})
export class AlsModule {
  static forRoot(config?: AlsModuleForRootConfig): DynamicModule {
    const isGlobal = config?.isGlobal ?? false;

    return {
      module: AlsModule,
      global: isGlobal,
      providers: [AlsService],
      exports: [AlsService],
    };
  }
}
