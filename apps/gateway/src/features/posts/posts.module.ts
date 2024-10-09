import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';

import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { PostPhotoStorageService } from './infrastructure/post-photo-storage.service';
import { FileStorageService } from '../../common/utils/file-storage.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { AddPostUseCase } from './application/use-cases/add-post.use-case';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { UploadPhotoUseCase } from './application/use-cases/upload-photo.use-case';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { AvatarRepository } from '../users/infrastructure/avatar.repository';
import { AvatarStorageService } from '../users/infrastructure/avatar-storage.service';
import { GetPublicPostUseCase } from './application/use-cases/get-public-post.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';

const useCases = [
  AddPostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UploadPhotoUseCase,
  GetPublicPostUseCase,
  GetPostsUseCase,
];
const repositories = [
  PostsRepository,
  PostsQueryRepository,
  UsersRepository,
  UsersQueryRepository,
  AvatarRepository,
];

const services = [
  FileStorageService,
  PostPhotoStorageService,
  AvatarStorageService,
];

@Module({
  imports: [CqrsModule, ClsTransactionalModule],
  controllers: [PostsController],
  providers: [...services, ...useCases, ...repositories],
  exports: [],
})
export class PostsModule {}
