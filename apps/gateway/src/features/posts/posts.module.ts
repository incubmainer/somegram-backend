import { Module } from '@nestjs/common';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ClsTransactionalModule } from '../../common/modules/cls-transactional.module';
import { PostPhotoStorageService } from './infrastructure/post-photo-storage.service';
import { FileStorageService } from '../../common/utils/file-storage.service';
import { PostsRepository } from './infrastructure/posts.repository';
import { AddPostUseCase } from './application/use-cases/add-post-use-case';
import { UserRepository } from '../auth/infrastructure/user.repository';

const useCases = [AddPostUseCase];

@Module({
  imports: [CqrsModule, ClsTransactionalModule],
  controllers: [PostsController],
  providers: [
    FileStorageService,
    PostPhotoStorageService,
    PostsRepository,
    UserRepository,
    ...useCases,
  ],
  exports: [],
})
export class PostsModule {}