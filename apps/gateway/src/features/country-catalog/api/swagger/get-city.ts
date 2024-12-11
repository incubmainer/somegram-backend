import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CityOutputDto } from '../dto/output-dto/country-catalog.output-dto';

export function CitiesInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of cities' }),
    ApiParam({ name: 'countryId' }),
    ApiOkResponse({
      description: 'Success',
      isArray: true,
      type: CityOutputDto,
    }),
    ApiNotFoundResponse({
      description: 'If cities for a specific country are not found',
    }),
  );
}
