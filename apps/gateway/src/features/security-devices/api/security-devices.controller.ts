import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { SecurityDevicesService } from '../application/security-devices.service';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllDevicesQueryCommand } from '../application/query-bus/get-all-devices.query';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { AuthGuard } from '@nestjs/passport';
import { TerminateAllDevicesExcludeCurrentSwagger } from './swagger/terminate-all-devices-exclude-current.swagger';
import { TerminateDevicesByIdSwagger } from './swagger/terminate-devices-by-id.swagger';

@ApiTags('Security Devices')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard('jwt'))
@Controller(SECURITY_DEVICES_ROUTE.MAIN)
export class SecurityDevicesController {
  constructor(
    //private readonly securityDevicesService: SecurityDevicesService,
    private readonly queryBus: QueryBus,
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
    @Param() deviceId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {}

  @Delete(`${SECURITY_DEVICES_ROUTE.TERMINATE}`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @TerminateAllDevicesExcludeCurrentSwagger()
  async terminateAllExcludeCurrent(
    @CurrentUserId() userId: string,
  ): Promise<void> {}
}
