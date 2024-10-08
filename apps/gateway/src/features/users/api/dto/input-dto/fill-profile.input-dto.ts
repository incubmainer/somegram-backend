import { ApiProperty } from '@nestjs/swagger';

export class FillProfileInputDto {
  @ApiProperty({
    description:
      'Username with a length between 6 and 30 characters. Allowed characters: 0-9, A-Z, a-z, _, -',
  })
  userName: string;

  @ApiProperty({
    description:
      'First name with a length between 1 and 50 characters. Allowed characters: A-Z, a-z, А-Я, а-я',
  })
  firstName: string;

  @ApiProperty({
    description:
      'Last name with a length between 1 and 50 characters. Allowed characters: A-Z, a-z, А-Я, а-я',
  })
  lastName: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '06.04.1999',
  })
  dateOfBirth: string;

  @ApiProperty({
    description:
      'About me with a length between 0 and 200 characters. Allowed characters: 0-9, A-Z, a-z, А-Я, а-я, special characters',
  })
  about: string;
  @ApiProperty({
    description: 'Is city name. Allowed characters: letters from any alphabet',
  })
  city: string;
  @ApiProperty({
    description:
      'Is country name. Allowed characters: letters from any alphabet',
  })
  country: string;
}
