import { ApiProperty } from '@nestjs/swagger';
import { IsUsername } from '../../../../../common/decorators/validation/is-username';
import { IsFirstName } from '../../../../../common/decorators/validation/is-first-name';
import { IsLastName } from '../../../../../common/decorators/validation/is-last-name';
import { IsDateOfBirth } from '../../../../../common/decorators/validation/is-date-of-birth';
import { IsAbout } from '../../../../../common/decorators/validation/is-about';
import { IsCityName } from '../../../../../common/decorators/validation/is-city';
import { IsCountry } from '../../../../../common/decorators/validation/is-coutry';

export class FillProfileInputDto {
  @IsUsername()
  @ApiProperty({
    description:
      'Username with a length between 6 and 30 characters. Allowed characters: 0-9, A-Z, a-z, _, -',
  })
  userName: string;

  @IsFirstName()
  @ApiProperty({
    description:
      'First name with a length between 1 and 50 characters. Allowed characters: A-Z, a-z, А-Я, а-я',
  })
  firstName: string;

  @IsLastName()
  @ApiProperty({
    description:
      'Last name with a length between 1 and 50 characters. Allowed characters: A-Z, a-z, А-Я, а-я',
  })
  lastName: string;

  @IsDateOfBirth()
  @ApiProperty({
    description: 'Date of birth',
    example: '06.04.1999',
    required: false,
  })
  dateOfBirth: string;

  @IsAbout()
  @ApiProperty({
    description:
      'About me with a length between 0 and 200 characters. Allowed characters: 0-9, A-Z, a-z, А-Я, а-я, special characters',
    required: false,
  })
  about: string;

  @IsCityName()
  @ApiProperty({
    description: 'Is city name. Allowed characters: letters from any alphabet',
    required: false,
  })
  city: string;

  @IsCountry()
  @ApiProperty({
    description:
      'Is country name. Allowed characters: letters from any alphabet',
    required: false,
  })
  country: string;
}
