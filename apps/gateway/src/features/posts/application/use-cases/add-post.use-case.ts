import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@nestjs-cls/transactional';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PostFileFactory } from '../../domain/files.factory';
import { Inject } from '@nestjs/common';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CreatedPostDto } from '../../domain/types';

export class AddPostCommand {
  constructor(
    public userId: string,
    public files: Express.Multer.File[],
    public description?: string,
  ) {}
}

@CommandHandler(AddPostCommand)
export class AddPostUseCase
  implements ICommandHandler<AddPostCommand, AppNotificationResultType<string>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(PostFileFactory.name)
    private readonly postFileFactory: typeof PostFileFactory,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
  ) {
    this.logger.setContext(AddPostUseCase.name);
  }
  async execute(
    command: AddPostCommand,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: add post command', this.execute.name);
    const { userId, files, description } = command;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();

      const uploadFiles: PostFileFactory[] =
        this.postFileFactory.createMany(files);

      const createdPostDto: CreatedPostDto = {
        userId: userId,
        createdAt: new Date(),
        description: description,
      };
      const result = await this.handleUpload(createdPostDto, uploadFiles);
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  async handleUpload(
    createdPostDto: CreatedPostDto,
    uploadFiles: PostFileFactory[],
  ): Promise<string> {
    const post = await this.postsRepository.addPost(createdPostDto);

    const uploadPromises = uploadFiles.map((file) =>
      this.photoServiceAdapter.uploadPostPhoto({
        ownerId: createdPostDto.userId,
        postId: post.id,
        file,
      }),
    );
    await Promise.all(uploadPromises);

    return post.id;
  }
}
