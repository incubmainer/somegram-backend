import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import {
  DELETE_AVATAR,
  DELETE_POST_PHOTOS,
  GET_POST_PHOTOS,
  GET_POSTS_PHOTOS,
  GET_USER_AVATAR,
  GET_USERS_AVATAR,
  UPLOAD_AVATAR,
  UPLOAD_POST_PHOTO,
} from '../constants/service.constants';
import { FileDto } from '../../features/posts/api/dto/input-dto/add-post.dto';
import { FileType } from '../../../../../libs/common/enums/file-type.enum';

@Injectable()
export class PhotoServiceAdapter {
  constructor(
    @Inject('PHOTO_SERVICE') private readonly fileServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async getPostPhotos(postId: string): Promise<FileType[]> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_POST_PHOTOS }, { postId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getAvatar(userId: string): Promise<FileType> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_USER_AVATAR }, { userId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async deleteAvatar(userId: string) {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: DELETE_AVATAR }, { userId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async uploadAvatar(payload: { ownerId: string; file: FileDto }) {
    try {
      const serviceResponse = this.fileServiceClient
        .send({ cmd: UPLOAD_AVATAR }, payload)
        .pipe(timeout(10000));
      const result = await firstValueFrom(serviceResponse);
      return result;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async uploadPostPhoto(payload: {
    ownerId: string;
    postId: string;
    file: FileDto;
  }) {
    try {
      const serviceResponse = this.fileServiceClient
        .send({ cmd: UPLOAD_POST_PHOTO }, payload)
        .pipe(timeout(10000));
      const result = await firstValueFrom(serviceResponse);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async deletePostPhotos(postId: string) {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: DELETE_POST_PHOTOS }, { postId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getUsersAvatar(userIds: string[]): Promise<FileType[]> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_USERS_AVATAR }, { userIds })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async getPostsPhotosByOwnerId(ownerIds: string[]): Promise<FileType[]> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_POSTS_PHOTOS }, { ownerIds })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);
      return result;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
