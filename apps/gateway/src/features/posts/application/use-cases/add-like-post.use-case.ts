import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { CreatePostLikeDto, LikeStatusEnum } from '../../domain/types';
import { LikePostEntity } from '../../domain/like.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsLikeRepository } from '../../infrastructure/posts-like.repository';

export class AddLikePostCommand {
  constructor(
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(AddLikePostCommand)
export class AddLikePostUseCase
  implements
    ICommandHandler<AddLikePostCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly postsRepository: PostsRepository,
    private readonly postsLikeRepository: PostsLikeRepository,
  ) {
    this.logger.setContext(AddLikePostUseCase.name);
  }
  async execute(
    command: AddLikePostCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: add like/unlike for post command',
      this.execute.name,
    );
    const { userId, postId } = command;
    try {
      const [post, userLike] = await Promise.all([
        this.postsRepository.getPostById(postId),
        this.postsLikeRepository.getLikeByPostIdAndUserId(postId, userId),
      ]);

      if (!post) return this.appNotification.notFound();

      if (!userLike) {
        await this.createNewLike(postId, userId);
      } else {
        await this.updateCurrentLike(userLike);
      }

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async createNewLike(postId: string, userId: string): Promise<void> {
    const currentDate = new Date();

    const createdCommentDto: CreatePostLikeDto = {
      createdAt: currentDate,
      updatedAt: currentDate,
      postId: postId,
      userId: userId,
      status: LikeStatusEnum.like,
    };

    await this.postsLikeRepository.addLike(createdCommentDto);
  }

  private async updateCurrentLike(like: LikePostEntity): Promise<void> {
    let status: LikeStatusEnum;

    if (like.status === LikeStatusEnum.like) {
      status = LikeStatusEnum.none;
    } else {
      status = LikeStatusEnum.like;
    }

    like.updateLike(status);

    await this.postsLikeRepository.updateLike(like);
  }
}
