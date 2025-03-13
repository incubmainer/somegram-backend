import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SecurityDevicesOutputDto } from '../dto/output/security-devices.output-dto';

export function GetAllDevicesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all active sessions of the current user',
    }),
    ApiCookieAuth(),
    ApiOkResponse({
      description: 'Success',
      type: SecurityDevicesOutputDto,
      isArray: true,
    }),
  );
}
