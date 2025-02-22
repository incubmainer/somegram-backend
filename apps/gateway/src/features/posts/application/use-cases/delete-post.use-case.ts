import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Transactional } from '@nestjs-cls/transactional';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements
    ICommandHandler<DeletePostCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(DeletePostUseCase.name);
  }
  async execute(
    command: DeletePostCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: delete post command', this.execute.name);
    const { postId, userId } = command;
    try {
      const post = await this.postsRepository.getPostById(postId);
      if (!post) return this.appNotification.notFound();
      if (post.userId !== userId) return this.appNotification.forbidden();

      await this.handleDelete(postId);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  async handleDelete(postId: string): Promise<void> {
    await Promise.all([
      this.photoServiceAdapter.deletePostPhotos(postId),
      this.postsRepository.deletePost(postId),
    ]);
  }
}
