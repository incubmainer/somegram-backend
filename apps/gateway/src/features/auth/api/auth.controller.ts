import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  RegistrationCodes,
  RegistrationCommand,
} from '../application/use-cases/registration.use-case';
import { Notification } from 'apps/gateway/src/common/domain/notification';
import { RegistrationBodyInputDto } from './dto/input-dto/registration.body.input-dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegistrationSwagger } from './swagger/registration.swagger';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Response } from 'express';
import { LoginDto } from './dto/input-dto/login-user-with-device.dto';
import { LoginUserCommand } from '../application/use-cases/login-use-case';
import { LoginSwagger } from './swagger/login.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('registration')
  @HttpCode(HttpStatus.OK)
  @RegistrationSwagger()
  public async registration(@Body() body: RegistrationBodyInputDto) {
    const notification: Notification<null> = await this.commandBus.execute(
      new RegistrationCommand(body.username, body.email, body.password),
    );
    const code = notification.getCode();
    if (code === RegistrationCodes.Success)
      return {
        statusCode: HttpStatus.OK,
        message: 'Registration successful',
      };
    if (code === RegistrationCodes.EmailAlreadyExists)
      throw new BadRequestException({
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          email: 'Email address is already in use.',
        },
      });
    if (code === RegistrationCodes.UsernameAlreadyExists)
      throw new BadRequestException({
        error: 'registration_failed',
        message:
          'Registration failed due to conflict with existing email or username.',
        details: {
          username: 'Username is already taken.',
        },
      });
    if (code === RegistrationCodes.TransactionError)
      throw new InternalServerErrorException({
        message: 'Transaction error',
      });
  }
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @LoginSwagger()
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req, @Res() response: Response) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip) {
      throw new NotFoundException({
        error: 'login failed',
        message: 'Unknown ip address',
        details: {
          ip: 'Invlid ip address',
        },
      });
    }
    const title = req.headers['user-agent'] || 'Mozilla';
    const user = req.user;
    const accesAndRefreshTokens = await this.commandBus.execute(
      new LoginUserCommand(user, ip, title),
    );

    return response
      .cookie('refreshToken', accesAndRefreshTokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .send(accesAndRefreshTokens.accessToken);
  }
}
