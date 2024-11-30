import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CountryOutputDto } from '../dto/output-dto/country-catalog.output-dto';

export function CountriesInfoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of countries' }),
    ApiOkResponse({
      description: 'Success. Or an empty array',
      isArray: true,
      type: CountryOutputDto,
    }),
  );
}
