import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum EnvState {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'test',
}
export type EnvVariableType = { [key: string]: string | undefined };

export class EnvSettings {
  @IsNotEmpty()
  @IsString()
  public readonly PAYMENTS_DATABASE_URL: string;
  @IsNotEmpty()
  @IsNumber()
  public readonly PAYMENTS_SERVICE_PORT: number;
  @IsNotEmpty()
  @IsString()
  public readonly PAYMENTS_SERVICE_HOST: string;
  @IsNotEmpty()
  @IsString()
  public readonly STRIPE_API_SECRET_KEY: string;
  @IsNotEmpty()
  @IsString()
  public readonly STRIPE_SIGNATURE_SECRET: string;
  @IsNotEmpty()
  @IsString()
  public readonly FRONTEND_SUCCESS_PAYMENT_URL: string;
  @IsNotEmpty()
  @IsString()
  public readonly FRONTEND_CANCEL_PAYMENT_URL: string;
  @IsNotEmpty()
  @IsString()
  public readonly RMQ_CONNECTION_STRING: string;
  @IsNotEmpty()
  @IsString()
  public readonly PAYPAL_CLIENT_ID: string;
  @IsNotEmpty()
  @IsString()
  public readonly PAYPAL_CLIENT_SECRET: string;
  @IsNotEmpty()
  @IsString()
  public readonly PAYPAL_WEBHOOK_ID: string;

  @IsEnum(EnvState)
  public readonly ENV: EnvState;

  constructor(envVariable: EnvVariableType) {
    this.PAYMENTS_DATABASE_URL = envVariable.PAYMENTS_DATABASE_URL;
    this.PAYMENTS_SERVICE_PORT = this.getNumberOrDefaultValue(
      envVariable.PAYMENTS_SERVICE_PORT,
      3006,
    );
    this.PAYMENTS_SERVICE_HOST = envVariable.PAYMENTS_SERVICE_HOST || '0.0.0.0';
    this.FRONTEND_SUCCESS_PAYMENT_URL =
      envVariable.FRONTEND_SUCCESS_PAYMENT_URL ||
      'http://localhost:3000/subscriptions/success';
    this.FRONTEND_CANCEL_PAYMENT_URL =
      envVariable.FRONTEND_CANCEL_PAYMENT_URL ||
      'http://localhost:3000/subscriptions/cancel';
    this.STRIPE_API_SECRET_KEY = envVariable.STRIPE_API_SECRET_KEY;
    this.STRIPE_SIGNATURE_SECRET = envVariable.STRIPE_SIGNATURE_SECRET;
    this.RMQ_CONNECTION_STRING = envVariable.RMQ_CONNECTION_STRING;
    this.PAYPAL_CLIENT_ID = envVariable.PAYPAL_CLIENT_ID;
    this.PAYPAL_CLIENT_SECRET = envVariable.PAYPAL_CLIENT_SECRET;
    this.PAYPAL_WEBHOOK_ID = envVariable.PAYPAL_WEBHOOK_ID;

    this.ENV = (envVariable.NODE_ENV as EnvState) || EnvState.DEVELOPMENT;
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
