import { Inject, Injectable } from '@nestjs/common';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { PAYPAL_CLIENT } from '../constants/adapters-name.constant';
import {
  ApiError,
  ApiResponse,
  Client,
  LinkHttpMethod,
  OAuthToken,
} from '@paypal/paypal-server-sdk';
import { SdkRequestBuilderFactory } from '@paypal/paypal-server-sdk/dist/types/clientInterface';
import {
  CreateSubscriptionDataType,
  PayPalPlansResponseType,
  PayPalPlansType,
  SubscriptionCreatedType,
  SubscriptionLinksType,
} from './types/paypal/types';
import { HttpMethod } from '@paypal/paypal-server-sdk/dist/types/core';
import { PAYPAL_PLANS, SUBSCRIPTIONS } from '../constants/paypal-path.constant';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  PayeePreferred,
  PayPalLinksRelEnum,
  PayPalProductIdEnum,
  PreferEnum,
  UserAction,
} from './types/paypal/enum';

// TODO Logger, App notification
@Injectable()
export class PayPalAdapter {
  constructor(
    @Inject(PAYPAL_CLIENT) private readonly paypalClient: Client,
    private readonly appNotification: ApplicationNotification,
  ) {}

  private async handleResult<T = null>(response: ApiResponse<any>): Promise<T> {
    if (typeof response.body === 'string') {
      return JSON.parse(response.body);
    } else if (response.body instanceof Blob) {
      const text = await response.body.text();
      return JSON.parse(text);
    } else if (response.body instanceof ReadableStream) {
      const text = await new Response(response.body).text();
      return JSON.parse(text);
    } else {
      return null;
    }
  }

  private async handleError(error: any): Promise<void> {
    if (error instanceof ApiError) {
      console.log(error.body);
    } else {
      console.log(error);
    }
  }

  private async login(): Promise<string | null> {
    const oAuth: OAuthToken =
      await this.paypalClient.clientCredentialsAuthManager.fetchToken();
    return oAuth.accessToken;
  }

  private async fetch<T = null, D = null>(
    method: HttpMethod,
    path: string,
    accessToken: string,
    body?: D,
    prefer: PreferEnum = PreferEnum.minimal,
  ): Promise<T> {
    const factory: SdkRequestBuilderFactory =
      this.paypalClient.getRequestBuilderFactory();

    const request = factory(method, path);
    request.headers({
      Authorization: `Bearer ${accessToken}`,
      Prefer: prefer,
    });

    if (body) {
      request.json(body);
    }

    const response = await request.call();
    return await this.handleResult(response);
  }

  public async createAutoPayment(payload: PaymentData): Promise<string | null> {
    try {
      const accessToken: string = await this.login();

      const {
        typeSubscription,
        userInfo,
        cancelFrontendUrl,
        successFrontendUrl,
      } = payload;

      const planKey: PayPalProductIdEnum =
        PayPalProductIdEnum[
          typeSubscription as keyof typeof PayPalProductIdEnum
        ];

      const plans: PayPalPlansResponseType = await this.fetch(
        LinkHttpMethod.Get,
        PAYPAL_PLANS,
        accessToken,
      );

      const plan: PayPalPlansType = plans.plans.find(
        (p: PayPalPlansType) => p.product_id === planKey,
      );

      const body: CreateSubscriptionDataType = {
        plan_id: plan.id,
        auto_renewal: true,
        subscriber: {
          name: { given_name: userInfo.userName },
          email_address: userInfo.email,
        },
        application_context: {
          brand_name: 'Somegram',
          locale: 'en-US',
          user_action: UserAction.SUBSCRIBE_NOW,
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: PayeePreferred.IMMEDIATE_PAYMENT_REQUIRED,
          },
          return_url: successFrontendUrl,
          cancel_url: cancelFrontendUrl,
        },
      };

      const createSubscription: SubscriptionCreatedType = await this.fetch(
        LinkHttpMethod.Post,
        SUBSCRIPTIONS,
        accessToken,
        body,
        PreferEnum.representation,
      );

      const link: SubscriptionLinksType = createSubscription.links.find(
        (l: SubscriptionLinksType) => l.rel === PayPalLinksRelEnum.APPROVE,
      );

      return link.href;
    } catch (e) {
      this.handleError(e);
      return null;
    }
  }
}
