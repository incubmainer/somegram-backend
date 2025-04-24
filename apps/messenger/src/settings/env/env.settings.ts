import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum EnvState {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'test',
}
export type EnvVariableType = { [key: string]: string | undefined };

export class EnvSettings {
  @IsEnum(EnvState)
  public readonly ENV: EnvState;

  @IsNotEmpty()
  @IsNumber()
  public readonly MESSENGER_SERVICE_PORT: number;

  @IsNotEmpty()
  @IsString()
  public readonly MESSENGER_SERVICE_HOST: string;

  @IsNotEmpty()
  @IsString()
  public readonly MESSENGER_DATABASE_URL: string;

  @IsNotEmpty()
  @IsString()
  public readonly RMQ_CONNECTION_STRING: string;

  constructor(envVariable: EnvVariableType) {
    this.ENV = (envVariable.NODE_ENV as EnvState) || EnvState.DEVELOPMENT;
    this.MESSENGER_DATABASE_URL = envVariable.MESSENGER_DATABASE_URL;
    this.RMQ_CONNECTION_STRING = envVariable.RMQ_CONNECTION_STRING;

    this.MESSENGER_SERVICE_PORT = this.getNumberOrDefaultValue(
      envVariable.MESSENGER_SERVICE_PORT,
      3555,
    );
    this.MESSENGER_SERVICE_HOST =
      envVariable.MESSENGER_SERVICE_HOST || '0.0.0.0';
  }

  getEnvState(): EnvState {
    return this.ENV;
  }

  isTestingState(): boolean {
    return this.ENV === EnvState.TESTING;
  }

  isProductionState(): boolean {
    return this.ENV === EnvState.PRODUCTION;
  }

  isDevelopmentState(): boolean {
    return this.ENV === EnvState.DEVELOPMENT;
  }

  isStagingState(): boolean {
    return this.ENV === EnvState.STAGING;
  }

  protected getNumberOrDefaultValue(
    value: string,
    defaultValue: number,
  ): number {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      return defaultValue;
    }
    return parsedValue;
  }
}
