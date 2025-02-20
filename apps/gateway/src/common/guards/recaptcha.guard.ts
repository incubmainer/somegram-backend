import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../../features/auth/application/auth.service';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const recaptchaToken: string | null = request.body?.recaptchaToken;

    if (!recaptchaToken)
      throw new BadRequestException(
        'Restore password failed due to invalid recaptcha token.',
      );

    const isValid = await this.authService.verifyRecaptchaToken(recaptchaToken);

    if (!isValid)
      throw new BadRequestException(
        'Restore password failed due to invalid recaptcha token.',
      );

    return true;
  }
}
