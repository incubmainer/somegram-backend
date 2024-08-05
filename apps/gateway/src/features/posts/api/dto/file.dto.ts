import { IsString, Validate } from 'class-validator';
import { IsPhotoMimetype } from '../../application/decorators/is-photo-mime-type';
import { IsPostPhoto } from '../../application/decorators/is-photo-for-post';

export class FileDto {
  @Validate(IsPostPhoto)
  buffer: Buffer;

  @IsString()
  @Validate(IsPhotoMimetype)
  mimetype: string;
}
