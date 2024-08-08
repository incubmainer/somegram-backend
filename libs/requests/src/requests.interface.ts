import { ModuleMetadata, Type } from '@nestjs/common';

export interface FieldOption {
  fieldName: string;
  generator: () => string;
  returnInResponse?: () => boolean;
}

export interface RequestsModuleOptions {
  fields: FieldOption[];
  cb: (values: Record<string, string>, next: () => void) => void;
}

export interface RequestsModuleFactory {
  createRequestsModuleOptions: () =>
    | Promise<RequestsModuleOptions>
    | RequestsModuleOptions;
}

export interface RequestsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<RequestsModuleFactory>;
  useExisting?: Type<RequestsModuleFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RequestsModuleOptions> | RequestsModuleOptions;
}
