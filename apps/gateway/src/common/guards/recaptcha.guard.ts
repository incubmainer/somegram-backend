import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../features/auth/application/auth.service';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../../settings/configuration/configuration';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly isProduction: boolean = false;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.isProduction = this.configService
      .get('envSettings', { infer: true })
      .isProductionState();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const recaptchaToken: string | null = request.body?.recaptchaToken;

    if (!recaptchaToken)
      throw new BadRequestException(
        'Restore password failed due to invalid recaptcha token.',
      );

    if (this.isProduction) {
      const isValid =
        await this.authService.verifyRecaptchaToken(recaptchaToken);
      if (!isValid)
        throw new BadRequestException(
          'Restore password failed due to invalid recaptcha token.',
        );
    }

    return true;
  }
}
