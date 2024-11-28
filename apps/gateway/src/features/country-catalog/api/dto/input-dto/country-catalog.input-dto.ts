import { CountryAvailableLanguageEnum } from '../../../domain/enum/country-catalog.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

/*
 TODO:
 Общий класс для обычного query и отнаследоваться от него?
 Добавить константы в либу для максимальной и минимальной длины ?
 Валидация для параметров ?
 Сделать либу с декораторами, сейчас нужно для Trim + EntityId
*/

export class CityCatalogQueryDto {
  @ApiProperty({
    description: 'City name',
    example: 'Berlin',
    type: String,
    required: false,
  })
  public name: string;

  @ApiProperty({
    description: 'Language',
    example: 'ENG',
    default: CountryAvailableLanguageEnum.ENG,
    enum: CountryAvailableLanguageEnum,
    required: false,
  })
  public language: CountryAvailableLanguageEnum;
}

export class CountryCatalogQueryDto {
  @ApiProperty({
    description: 'Country name',
    example: 'Germany',
    type: String,
    required: false,
  })
  public name: string;
  @ApiProperty({
    description: 'Language',
    example: 'ENG',
    default: CountryAvailableLanguageEnum.ENG,
    enum: CountryAvailableLanguageEnum,
    required: false,
  })
  public language: CountryAvailableLanguageEnum;
}

class CountryAndCityCatalogQueryFactory {
  protected readonly availableValue = {
    language: [
      CountryAvailableLanguageEnum.ENG,
      CountryAvailableLanguageEnum.RU,
    ],
  };
}

export class CountryCatalogQueryFactory extends CountryAndCityCatalogQueryFactory {
  @ApiProperty({
    description: 'City name',
    example: 'Berlin',
    type: String,
    required: false,
  })
  public name: string;
  @ApiProperty({
    description: 'Language',
    example: 'ENG',
    default: CountryAvailableLanguageEnum.ENG,
    enum: CountryAvailableLanguageEnum,
    required: false,
  })
  @IsEnum(CountryAvailableLanguageEnum)
  public language: CountryAvailableLanguageEnum;

  createQuery(query: CityCatalogQueryDto): CityCatalogQueryDto {
    return {
      language: query.language,
      name: query.name,
    };
  }
}
