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
import { SECURITY_DEVICES_ROUTE } from '../../../common/config/constants/route.constants';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SecurityDevicesOutputDto } from './dto/output/security-devices.output-dto';
import { GetAllDevicesSwagger } from './swagger/get-all-devices.swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllDevicesQueryCommand } from '../application/query-command/get-all-devices.query';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { AuthGuard } from '@nestjs/passport';
import { TerminateAllDevicesExcludeCurrentSwagger } from './swagger/terminate-all-devices-exclude-current.swagger';
import { TerminateDevicesByIdSwagger } from './swagger/terminate-devices-by-id.swagger';
import { TerminateDeviceByIdCommand } from '../application/use-cases/terminate-device-by-id.use-case';
import { TerminateDevicesExcludeCurrentCommand } from '../application/use-cases/terminate-devices-exclude-current.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

// TODO maybe create by refresh token?
@ApiTags('Security Devices')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard('jwt'))
@Controller(SECURITY_DEVICES_ROUTE.MAIN)
export class SecurityDevicesController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @GetAllDevicesSwagger()
  async getAll(
    @CurrentUserId() userId: string,
  ): Promise<SecurityDevicesOutputDto[]> {
    return await this.queryBus.execute(new GetAllDevicesQueryCommand(userId));
  }

  @Delete(`${SECURITY_DEVICES_ROUTE.TERMINATE}/:deviceId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @TerminateDevicesByIdSwagger()
  async terminateDeviceById(
    @Param('deviceId') deviceId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    // TODO Сделать логику выполнения в одной транзакции и блокировка записи в БД когда удаляем ее
    const result: AppNotificationResultType<void> =
      await this.commandBus.execute(
        new TerminateDeviceByIdCommand(userId, deviceId),
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
    @CurrentUserId() userId: string,
  ): Promise<void> {
    // TODO Сделать логику выполнения в одной транзакции и блокировка записи в БД когда удаляем ее
    // TODO Decorator client info with device id
    const result: AppNotificationResultType<void> =
      await this.commandBus.execute(
        new TerminateDevicesExcludeCurrentCommand(userId, ''),
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
