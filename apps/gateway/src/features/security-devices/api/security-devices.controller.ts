import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SECURITY_DEVICES_ROUTE } from '../../../common/constants/route.constants';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SecurityDevicesOutputDto } from './dto/output/security-devices.output-dto';
import { GetAllDevicesSwagger } from './swagger/get-all-devices.swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllDevicesQueryCommand } from '../application/query-command/get-all-devices.query';
import { TerminateAllDevicesExcludeCurrentSwagger } from './swagger/terminate-all-devices-exclude-current.swagger';
import { TerminateDevicesByIdSwagger } from './swagger/terminate-devices-by-id.swagger';
import { TerminateDeviceByIdCommand } from '../application/use-cases/terminate-device-by-id.use-case';
import { TerminateDevicesExcludeCurrentCommand } from '../application/use-cases/terminate-devices-exclude-current.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { RefreshJWTAccessGuard } from '../../../common/guards/jwt/jwt-refresh-auth-guard';
import { CurrentUser } from '@app/decorators/http-parse/current-user';
import { JWTRefreshTokenPayloadType } from '../../../common/domain/types/types';

@ApiTags('Security Devices')
@ApiBearerAuth('refresh-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(RefreshJWTAccessGuard)
@Controller(SECURITY_DEVICES_ROUTE.MAIN)
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @GetAllDevicesSwagger()
  async getAll(
    @CurrentUser() user: JWTRefreshTokenPayloadType,
  ): Promise<SecurityDevicesOutputDto[]> {
    return await this.queryBus.execute(
      new GetAllDevicesQueryCommand(user.userId),
    );
  }

  @Delete(`${SECURITY_DEVICES_ROUTE.TERMINATE}/:deviceId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @TerminateDevicesByIdSwagger()
  async terminateDeviceById(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: JWTRefreshTokenPayloadType,
  ): Promise<void> {
    const result: AppNotificationResultType<void> =
      await this.commandBus.execute(
        new TerminateDeviceByIdCommand(user.userId, deviceId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        return;
      case AppNotificationResultEnum.Forbidden:
        throw new ForbiddenException();
      case AppNotificationResultEnum.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Delete(`${SECURITY_DEVICES_ROUTE.TERMINATE}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @TerminateAllDevicesExcludeCurrentSwagger()
  async terminateAllExcludeCurrent(
    @CurrentUser() user: JWTRefreshTokenPayloadType,
  ): Promise<void> {
    const result: AppNotificationResultType<void> =
      await this.commandBus.execute(
        new TerminateDevicesExcludeCurrentCommand(user.userId, user.deviceId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        return;
      case AppNotificationResultEnum.Forbidden:
        throw new ForbiddenException();
      case AppNotificationResultEnum.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
