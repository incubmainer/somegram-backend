import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { S3Adapter } from '../../common/application/adapters/s3.adapter';

import { PhotosController } from './api/photos.controller';
import { PhotosService } from './api/files.service';
import { PhotosRepository } from './infrastructure/photos.repository';
import { PhotosQueryRepository } from './infrastructure/photos.query.repository';
import { PostPhoto, PostPhotoSchema } from './models/post-photo.model';
import { Avatar, AvatarSchema } from './models/avatar.model';
import { UploadAvatarUseCase } from './api/applications/use-cases/upload-avatar.useCase';
import { SavePostPhotoUseCase } from './api/applications/use-cases/save-post-photo.useCase';
import { DeleteAvatarUseCase } from './api/applications/use-cases/delete-avatar.useCase';
import { DeletePostPhotosUseCase } from './api/applications/use-cases/delete-post-photos.useCase';

const providers = [PhotosService, S3Adapter];
const repositories = [PhotosRepository];
const queryRepositories = [PhotosQueryRepository];
const useCases = [
  UploadAvatarUseCase,
  SavePostPhotoUseCase,
  DeleteAvatarUseCase,
  DeletePostPhotosUseCase,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PostPhoto.name, schema: PostPhotoSchema },
      { name: Avatar.name, schema: AvatarSchema },
    ]),
  ],
  controllers: [PhotosController],
  providers: [...providers, ...repositories, ...queryRepositories, ...useCases],
})
export class PhotosModule {}
