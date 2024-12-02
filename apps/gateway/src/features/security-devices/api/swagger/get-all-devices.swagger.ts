import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SecurityDevicesOutputDto } from '../dto/output/security-devices.output-dto';

export function GetAllDevicesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add user post' }),
    ApiOkResponse({
      description: 'Success',
      type: SecurityDevicesOutputDto,
      isArray: true,
    }),
    //ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
