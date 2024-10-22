import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';

import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { PostPhotoStorageService } from './infrastructure/post-photo-storage.service';
import { FileStorageService } from '../../common/utils/file-storage.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { PostsQueryRepository } from './infrastructure/posts.query-repository';
import { AvatarRepository } from '../users/infrastructure/avatar.repository';
import { AvatarStorageService } from '../users/infrastructure/avatar-storage.service';
import { GetPostUseCase } from './application/use-cases/get-public-post.use-case';
import { GetPostsByUserUseCase } from './application/use-cases/get-posts-by-user.use-case';
import { PostPhotoRepository } from './infrastructure/post-photos.repository';
import { AddPostUseCase } from './application/use-cases/add-post.use-case';
import { PublicPostsController } from './api/public-posts.controller';

const useCases = [
  UpdatePostUseCase,
  DeletePostUseCase,
  GetPostUseCase,
  GetPostsByUserUseCase,
  AddPostUseCase,
];
const repositories = [
  PostsRepository,
  PostsQueryRepository,
  UsersRepository,
  UsersQueryRepository,
  AvatarRepository,
  PostPhotoRepository,
];

const services = [
  FileStorageService,
  PostPhotoStorageService,
  AvatarStorageService,
];

@Module({
  imports: [CqrsModule, ClsTransactionalModule],
  controllers: [PostsController, PublicPostsController],
  providers: [...services, ...useCases, ...repositories],
  exports: [],
})
export class PostsModule {}
