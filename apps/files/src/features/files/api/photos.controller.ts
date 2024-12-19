import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import { PhotosService } from './files.service';
import {
  DELETE_AVATAR,
  DELETE_POST_PHOTOS,
  GET_POST_PHOTOS,
  GET_USER_AVATAR,
  UPLOAD_AVATAR,
  UPLOAD_POST_PHOTO,
} from '../../../../../gateway/src/common/constants/service.constants';
import { FileDto } from '../../../../../gateway/src/features/posts/api/dto/input-dto/add-post.dto';
import { UploadAvatarCommand } from './applications/use-cases/upload-avatar.useCase';
import { SavePostPhotoCommand } from './applications/use-cases/save-post-photo.useCase';
import { DeleteAvatarCommand } from './applications/use-cases/delete-avatar.useCase';
import { DeletePostPhotosCommand } from './applications/use-cases/delete-post-photos.useCase';

@Controller('files')
export class PhotosController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly filesService: PhotosService,
  ) {}

  @MessagePattern({ cmd: GET_POST_PHOTOS })
  async getPostPhotos({ postId }) {
    return this.filesService.getPostPhotos(postId);
  }

  @MessagePattern({ cmd: GET_USER_AVATAR })
  async getAvatar({ userId }) {
    return this.filesService.getUserAvatar(userId);
  }

  @MessagePattern({ cmd: UPLOAD_AVATAR })
  async uploadAvatar(payload: { ownerId: string; file: FileDto }) {
    return this.commandBus.execute(new UploadAvatarCommand(payload));
  }

  @MessagePattern({ cmd: DELETE_AVATAR })
  async deleteAvatar(payload: { userId: string }) {
    return this.commandBus.execute(new DeleteAvatarCommand(payload));
  }

  @MessagePattern({ cmd: DELETE_POST_PHOTOS })
  async deletePostPhotos(payload: { postId: string }) {
    return this.commandBus.execute(new DeletePostPhotosCommand(payload));
  }

  @MessagePattern({ cmd: UPLOAD_POST_PHOTO })
  async uploadPostPhoto(payload: {
    ownerId: string;
    postId: string;
    file: FileDto;
  }) {
    return this.commandBus.execute(new SavePostPhotoCommand(payload));
  }
}
