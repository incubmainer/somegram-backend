import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { UserPost } from '@prisma/gateway';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public description?: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements
    ICommandHandler<UpdatePostCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdatePostUseCase.name);
  }
  async execute(
    command: UpdatePostCommand,
  ): Promise<AppNotificationResultType<null>> {
    const { postId, userId, description } = command;
    try {
      const post: UserPost | null =
        await this.postsRepository.getPostById(postId);
      if (!post) return this.appNotification.notFound();
      if (post.userId !== userId) return this.appNotification.forbidden();

      await this.postsRepository.updatePost({
        postId,
        description,
        updatedAt: new Date(),
      });
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
