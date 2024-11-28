import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CityOutputDto } from '../dto/output-dto/country-catalog.output-dto';

export function CitiesInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of cities' }),
    ApiOkResponse({
      description: 'Success',
      type: CityOutputDto,
    }),
  );
}
