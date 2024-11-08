import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, Max, MaxLength } from 'class-validator';

export enum MimeTypes {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
}

export const POST_CONSTRAINTS = {
  MIN_PHOTO_COUNT: 1,
  MAX_PHOTO_COUNT: 10,
  MAX_PHOTO_SIZE: 20,
  DESCRIPTION_MAX_LENGTH: 500,
  ALLOWED_MIMETYPES: Object.values(MimeTypes),
};

export class AddPostDto {
  @ApiProperty({
    description: `Post description, max length ${POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.`,
    type: String,
    maxLength: POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
    required: false,
  })
  @MaxLength(POST_CONSTRAINTS.DESCRIPTION_MAX_LENGTH)
  description: string;
}

export class FileDto {
  @IsString()
  @IsNotEmpty()
  public originalname: string;

  @Max(POST_CONSTRAINTS.MAX_PHOTO_SIZE * 1024 * 1024)
  public size: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(MimeTypes)
  public mimetype: string;

  constructor(
    originalname: string,
    size: number,
    mimetype: string,
    public buffer: Buffer,
  ) {
    this.originalname = originalname;
    this.size = size;
    this.mimetype = mimetype;
  }
}
