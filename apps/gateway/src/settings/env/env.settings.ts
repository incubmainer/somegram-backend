import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

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
  @IsNumber()
  public readonly PORT: number;
  @IsString()
  public readonly GLOBAL_PREFIX: string;
  @IsBoolean()
  public readonly SWAGGER_ENABLED: boolean;
  @IsNotEmpty()
  @IsString()
  public readonly GATEWAY_DATABASE_URL: string;
  @IsNumber()
  public readonly RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS: number; // Optional, default: 300000
  @IsNumber()
  public readonly EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS: number; // Optional, default: 300000
  @IsNotEmpty()
  @IsString()
  public readonly RECAPTCHA_SECRET_KEY: string;
  @IsNotEmpty()
  @IsString()
  public readonly RECAPTCHA_SITE_KEY: string;
  @IsNotEmpty()
  @IsString()
  public readonly FRONTED_PROVIDER: string;
  @IsNotEmpty()
  @IsString()
  public readonly RMQ_CONNECTION_STRING: string;


  @IsNotEmpty()
  @IsString()
  public readonly EMAIL_SERVICE: string;
  @IsNotEmpty()
  @IsString()
  public readonly EMAIL_USER: string;
  @IsNotEmpty()
  @IsString()
  public readonly EMAIL_PASSWORD: string;


  @IsNotEmpty()
  @IsString()
  public readonly PHOTO_SERVICE_HOST: string;
  @IsNotEmpty()
  //@IsNumber()
  public readonly PHOTO_SERVICE_PORT: string;

  @IsNotEmpty()
  @IsString()
  public readonly GITHUB_CLIENT_SECRET: string;
  @IsNotEmpty()
  @IsString()
  public readonly GITHUB_CLIENT_ID: string;
  @IsNotEmpty()
  @IsString()
  public readonly GITHUB_CALLBACK_URL: string;


  @IsNotEmpty()
  @IsString()
  public readonly GOOGLE_CLIENT_ID: string;
  @IsNotEmpty()
  @IsString()
  public readonly GOOGLE_REDIRECT_URI: string;
  @IsNotEmpty()
  @IsString()
  public readonly GOOGLE_CLIENT_SECRET: string;

  constructor(envVariable: EnvVariableType) {
    this.ENV = (envVariable.NODE_ENV as EnvState) || EnvState.DEVELOPMENT;
    this.PORT = this.getNumberOrDefaultValue(envVariable.PORT, 3000);
    this.GLOBAL_PREFIX = envVariable.GLOBAL_PREFIX || '';
    this.SWAGGER_ENABLED = envVariable.SWAGGER_ENABLED === 'true' || true;

    // TODO сделать трансормацию и валидацию параметра
    this.RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS =
      +envVariable.RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS;

    // TODO сделать трансормацию и валидацию параметра
    this.EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS =
      +envVariable.EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS;

    this.RECAPTCHA_SECRET_KEY = envVariable.RECAPTCHA_SECRET_KEY;
    this.RECAPTCHA_SITE_KEY = envVariable.RECAPTCHA_SITE_KEY;
    this.FRONTED_PROVIDER = envVariable.FRONTED_PROVIDER;
    this.RMQ_CONNECTION_STRING = envVariable.RMQ_CONNECTION_STRING;
    this.GATEWAY_DATABASE_URL = envVariable.GATEWAY_DATABASE_URL;

    this.EMAIL_SERVICE = envVariable.EMAIL_SERVICE;
    this.EMAIL_USER = envVariable.EMAIL_USER;
    this.EMAIL_PASSWORD = envVariable.EMAIL_PASSWORD;

    this.PHOTO_SERVICE_HOST = envVariable.PHOTO_SERVICE_HOST;
    // TODO сделать трансормацию и валидацию параметра и значение по умолчанию
    this.PHOTO_SERVICE_PORT = envVariable.PHOTO_SERVICE_PORT;

    this.GITHUB_CLIENT_SECRET = envVariable.GITHUB_CLIENT_SECRET;
    this.GITHUB_CLIENT_ID = envVariable.GITHUB_CLIENT_ID;
    this.GITHUB_CALLBACK_URL = envVariable.GITHUB_CALLBACK_URL;

    this.GOOGLE_CLIENT_ID = envVariable.GOOGLE_CLIENT_ID;
    this.GOOGLE_REDIRECT_URI = envVariable.GOOGLE_REDIRECT_URI;
    this.GOOGLE_CLIENT_SECRET = envVariable.GOOGLE_CLIENT_SECRET;

    this.PORT = this.getNumberOrDefaultValue(envVariable.PORT, 3000);
    this.RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS =
      this.getNumberOrDefaultValue(
        envVariable.RESTORE_PASSWORD_CODE_EXPIRE_AFTER_MILISECONDS,
        300000,
      );
    this.EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS =
      this.getNumberOrDefaultValue(
        envVariable.EMAIL_CONFIRMATION_TOKEN_EXPIRE_AFTER_MILISECONDS,
        300000,
      );
    this.PHOTO_SERVICE_PORT = this.getNumberOrDefaultValue(
      envVariable.PHOTO_SERVICE_PORT,
      3001,
    );
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
