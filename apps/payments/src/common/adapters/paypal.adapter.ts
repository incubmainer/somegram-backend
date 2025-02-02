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
  ManageSubscriptionBodyType,
  PayPalPlansResponseType,
  PayPalPlansType,
  SubscriptionCreatedType,
  SubscriptionDetailsType,
  SubscriptionLinksType,
} from './types/paypal/types';
import { HttpMethod } from '@paypal/paypal-server-sdk/dist/types/core';
import {
  ACTIVATE_SUBSCRIPTIONS,
  CANCEL_SUBSCRIPTIONS,
  PAYPAL_PLANS,
  SUBSCRIPTIONS,
  SUSPEND_SUBSCRIPTIONS,
} from '../constants/paypal-path.constant';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  FailureActionEnum,
  PayeePreferred,
  PayPalLinksRelEnum,
  PayPalProductIdEnum,
  PreferEnum,
  UserAction,
} from './types/paypal/enum';
import { CommandBus } from '@nestjs/cqrs';
import { PayPalSubscriptionCreateUseCase } from '../../features/payments/application/use-cases/command/paypal-subscription-create.use-case';
import { LoggerService } from '@app/logger';
import * as Bluebird from 'bluebird';

@Injectable()
export class PayPalAdapter {
  constructor(
    @Inject(PAYPAL_CLIENT) private readonly paypalClient: Client,
    private readonly commandBus: CommandBus,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PayPalAdapter.name);
  }

  private async handleResult<T = null>(response: ApiResponse<any>): Promise<T> {
    if (typeof response.body === 'string') {
      return response?.body ? JSON.parse(response.body) : null;
    } else if (response.body instanceof Blob) {
      const text = await response.body.text();
      return text ? JSON.parse(text) : null;
    } else if (response.body instanceof ReadableStream) {
      const text = await new Response(response.body).text();
      return text ? JSON.parse(text) : null;
    } else {
      return null;
    }
  }

  private async handleError(error: any): Promise<void> {
    if (error instanceof ApiError) {
      this.logger.error(error.body, this.handleError.name);
    } else {
      this.logger.error(error, this.handleError.name);
    }
  }

  private async login(): Promise<string | null> {
    this.logger.debug('Execute: login paypal', this.login.name);
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
    this.logger.debug('Execute: fetch to paypal', this.fetch.name);
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

  public async createAutoPayment(
    payload: PaymentData,
    accessToken: string = null,
    startDate: Date = null,
  ): Promise<string | null> {
    try {
      this.logger.debug(
        'Execute: create paypal payment',
        this.createAutoPayment.name,
      );
      if (!accessToken) accessToken = await this.login();

      const {
        subscriptionType,
        userInfo,
        cancelFrontendUrl,
        successFrontendUrl,
      } = payload;

      const planKey: PayPalProductIdEnum =
        PayPalProductIdEnum[
          subscriptionType as keyof typeof PayPalProductIdEnum
        ];

      const plans: PayPalPlansResponseType = await this.getPlans(accessToken);

      const plan: PayPalPlansType = plans.plans.find(
        (p: PayPalPlansType) =>
          p.product_id === planKey && p.status === 'ACTIVE',
      );

      const body: CreateSubscriptionDataType = {
        plan_id: plan.id,
        auto_renewal: true,
        custom_id: userInfo.userId,
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
        plan: {
          payment_preferences: {
            setup_fee_failure_action: FailureActionEnum.CANCEL,
          },
        },
      };

      if (startDate) body.start_time = startDate.toISOString();

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

      const result: AppNotificationResultType<null> =
        await this.commandBus.execute(
          new PayPalSubscriptionCreateUseCase(
            createSubscription,
            subscriptionType,
          ),
        );

      if (result.appResult !== AppNotificationResultEnum.Success) return null;

      return link.href;
    } catch (e) {
      this.handleError(e);
      return null;
    }
  }

  public async updateAutoPayment(
    payload: PaymentData,
    accessToken: string = null,
  ): Promise<string | null> {
    this.logger.debug(
      'Execute: update paypal payment',
      this.updateAutoPayment.name,
    );
    if (!accessToken) accessToken = await this.login();
    const { currentSubDateEnd } = payload;

    return await this.createAutoPayment(
      payload,
      accessToken,
      currentSubDateEnd,
    );
  }

  public async getPlans(
    accessToken: string = null,
  ): Promise<PayPalPlansResponseType> {
    this.logger.debug('Execute: get paypal plans', this.getPlans.name);
    if (!accessToken) accessToken = await this.login();
    return await this.fetch(LinkHttpMethod.Get, PAYPAL_PLANS, accessToken);
  }

  public async getSubscriptionDetails(
    id: string,
    accessToken: string = null,
  ): Promise<SubscriptionDetailsType> {
    this.logger.debug(
      'Execute: get paypal subscription details',
      this.getSubscriptionDetails.name,
    );
    if (!accessToken) accessToken = await this.login();
    return await this.fetch(
      LinkHttpMethod.Get,
      `${SUBSCRIPTIONS}/${id}`,
      accessToken,
    );
  }

  public async disableAutoRenewal(
    subscriptionId: string,
    accessToken: string = null,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: disable paypal auto renewal',
      this.disableAutoRenewal.name,
    );
    try {
      if (!accessToken) accessToken = await this.login();

      const body: ManageSubscriptionBodyType = {
        reason: 'The user wants to cancel the subscription',
      };

      await this.fetch(
        LinkHttpMethod.Post,
        `${SUBSCRIPTIONS}/${subscriptionId}/${SUSPEND_SUBSCRIPTIONS}`,
        accessToken,
        body,
      );
      return true;
    } catch (e) {
      this.logger.error(e, this.disableAutoRenewal.name);
      return false;
    }
  }

  public async enableAutoRenewal(
    subscriptionId: string,
    accessToken: string = null,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: enable paypal auto renewal',
      this.enableAutoRenewal.name,
    );
    try {
      if (!accessToken) accessToken = await this.login();

      const body: ManageSubscriptionBodyType = {
        reason: 'Continue the subscription',
      };

      await this.fetch(
        LinkHttpMethod.Post,
        `${SUBSCRIPTIONS}/${subscriptionId}/${ACTIVATE_SUBSCRIPTIONS}`,
        accessToken,
        body,
      );
      return true;
    } catch (e) {
      this.logger.error(e, this.enableAutoRenewal.name);
      return false;
    }
  }

  public async cancelSubscription(
    subscriptionId: string,
    accessToken: string = null,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: cancel paypal subscription',
      this.cancelSubscription.name,
    );
    if (!accessToken) accessToken = await this.login();

    const body: ManageSubscriptionBodyType = {
      reason: 'User cancels subscription',
    };

    await this.fetch(
      LinkHttpMethod.Post,
      `${SUBSCRIPTIONS}/${subscriptionId}/${CANCEL_SUBSCRIPTIONS}`,
      accessToken,
      body,
    );
    return true;
  }

  public async cancelManySubscription(
    subscriptionIds: string[],
    accessToken: string = null,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: cancel paypal many subscriptions',
      this.cancelManySubscription.name,
    );

    if (!accessToken) accessToken = await this.login();

    const body: ManageSubscriptionBodyType = {
      reason: 'User cancels subscription',
    };

    await Bluebird.map(
      subscriptionIds,
      async (subscriptionId: string): Promise<void> => {
        await this.fetch(
          LinkHttpMethod.Post,
          `${SUBSCRIPTIONS}/${subscriptionId}/${CANCEL_SUBSCRIPTIONS}`,
          accessToken,
          body,
        );
      },
      { concurrency: 8 },
    );

    return true;
  }
}
